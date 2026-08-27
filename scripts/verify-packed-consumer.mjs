import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readPublicPackageManifests } from './public-package-manifests.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryPrefix = join(tmpdir(), 'rockets-packed-consumer-');
const temporaryRoot = mkdtempSync(temporaryPrefix);
const tarballsRoot = join(temporaryRoot, 'tarballs');
const consumerRoot = join(temporaryRoot, 'consumer');
const noZodConsumerRoot = join(temporaryRoot, 'consumer-no-zod');
const storageProviderConsumerRoot = join(
  temporaryRoot,
  'consumer-storage-provider',
);

const consumerDependencies = [
  '@aws-sdk/client-s3@3.1103.0',
  '@aws-sdk/lib-storage@3.1103.0',
  '@aws-sdk/s3-presigned-post@3.1103.0',
  '@aws-sdk/s3-request-presigner@3.1103.0',
  '@nestjs/common@12.0.0-alpha.5',
  '@nestjs/core@12.0.0-alpha.5',
  '@nestjs/platform-express@12.0.0-alpha.5',
  '@nestjs/typeorm@11.0.3',
  '@types/node@20.19.43',
  'class-transformer@0.5.1',
  'class-validator@0.14.3',
  'firebase-admin@13.10.0',
  'nestjs-zod@5.4.0',
  'reflect-metadata@0.1.14',
  'rxjs@7.8.2',
  'typeorm@0.3.31',
  'typescript@5.9.3',
  'zod@4.4.3',
];

function run(command, args, cwd, options = {}) {
  try {
    execFileSync(command, args, {
      cwd,
      encoding: options.quiet ? 'utf8' : undefined,
      env: process.env,
      stdio: options.quiet ? 'pipe' : 'inherit',
    });
  } catch (error) {
    if (options.quiet) {
      if (error.stdout) process.stdout.write(error.stdout);
      if (error.stderr) process.stderr.write(error.stderr);
    }
    throw error;
  }
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

try {
  mkdirSync(tarballsRoot);
  mkdirSync(consumerRoot);
  mkdirSync(noZodConsumerRoot);
  mkdirSync(storageProviderConsumerRoot);

  const workspaces = readPublicPackageManifests(repositoryRoot, {
    namePrefix: '@concepta/',
  });
  if (workspaces.length === 0) {
    throw new Error('No public @concepta/* workspaces were found.');
  }

  const versions = new Set(workspaces.map((manifest) => manifest.version));
  if (versions.size !== 1) {
    throw new Error(
      `Public workspace versions are not aligned: ${[...versions].join(', ')}`,
    );
  }

  const tarballs = workspaces.map((manifest) => {
    const filename = `${manifest.name.replace('@', '').replace('/', '-')}-${
      manifest.version
    }.tgz`;
    const tarball = join(tarballsRoot, filename);
    run(
      'corepack',
      ['yarn', 'workspace', manifest.name, 'pack', '--out', tarball],
      repositoryRoot,
      { quiet: true },
    );
    return tarball;
  });
  const coreTarball = tarballs.find((tarball) =>
    tarball.includes('concepta-rockets-core-'),
  );
  if (coreTarball === undefined) {
    throw new Error('Missing @concepta/rockets-core tarball.');
  }
  const storageTarball = tarballs.find((tarball) =>
    tarball.includes('concepta-rockets-storage-'),
  );
  if (storageTarball === undefined) {
    throw new Error('Missing @concepta/rockets-storage tarball.');
  }

  writeJson(join(consumerRoot, 'package.json'), {
    name: 'rockets-packed-consumer-smoke',
    version: '0.0.0',
    private: true,
  });

  // Nest 12.0.0-alpha.5 still advertises Nest 11 peers internally, so npm's
  // strict resolver rejects the otherwise intentional alpha stack. Install
  // every required peer explicitly, then bypass only that upstream metadata
  // conflict; runtime imports, type checking, and app bootstrap remain gated.
  // Remove --legacy-peer-deps when @nestjs/core@12 advertises ^12 peers
  // (verify: npm view @nestjs/core@<ver> peerDependencies).
  run(
    'npm',
    [
      'install',
      '--save-exact',
      '--legacy-peer-deps',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      ...tarballs,
      ...consumerDependencies,
    ],
    consumerRoot,
  );

  const entrypointChecks = [
    ['@concepta/rockets', 'RocketsModule'],
    ['@concepta/rockets-adapter-firebase', 'FirebaseAuthModule'],
    ['@concepta/rockets-auth', 'RocketsAuthModule'],
    ['@concepta/rockets-core', 'RocketsCoreModule'],
    ['@concepta/rockets-core/standard-schema', 'StandardSchemaModule'],
    ['@concepta/rockets-core/standard-schema', 'createStandardSchemaDto'],
    [
      '@concepta/rockets-core/standard-schema/swagger',
      'ApiStandardSchemaResponse',
    ],
    ['@concepta/rockets-core/zod', 'compileDtoClass'],
    ['@concepta/rockets-core/zod', 'namedZodDto'],
    ['@concepta/rockets-repository-firestore', 'FirestoreRepositoryModule'],
    ['@concepta/rockets-repository-typeorm', 'TypeOrmRepositoryModule'],
    ['@concepta/rockets-repository-typeorm/zod', 'typeOrmZodEntityCompiler'],
    ['@concepta/rockets-storage', 'StorageModule'],
    ['@concepta/rockets-storage/core', 'StorageClient'],
    ['@concepta/rockets-storage/files-sdk', 'createFilesSdkDriver'],
    ['@concepta/rockets-storage/files-sdk/fs', 'createFsStorageDriver'],
    [
      '@concepta/rockets-storage/files-sdk/provider',
      'createProviderStorageDriver',
    ],
    ['@concepta/rockets-storage/files-sdk/s3', 'createS3StorageDriver'],
    ['@concepta/rockets-storage/testing', 'createMemoryStorageDriver'],
  ];

  writeFileSync(
    join(consumerRoot, 'verify-cjs.cjs'),
    `'use strict';\nconst checks = ${JSON.stringify(
      entrypointChecks,
    )};\nfor (const [specifier, symbol] of checks) {\n  const loaded = require(specifier);\n  if (!(symbol in loaded)) throw new Error(\`Missing \${symbol} from CJS \${specifier}\`);\n}\n`,
  );
  writeFileSync(
    join(consumerRoot, 'verify-esm.mjs'),
    `const checks = ${JSON.stringify(
      entrypointChecks,
    )};\nfor (const [specifier, symbol] of checks) {\n  const loaded = await import(specifier);\n  const commonJsDefault = loaded.default;\n  const exported = symbol in loaded || (typeof commonJsDefault === 'object' && commonJsDefault !== null && symbol in commonJsDefault);\n  if (!exported) throw new Error(\`Missing \${symbol} from ESM \${specifier}\`);\n}\n`,
  );

  writeJson(join(consumerRoot, 'tsconfig.json'), {
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      target: 'ES2022',
      strict: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      outDir: 'dist',
      skipLibCheck: false,
    },
    include: ['consumer.ts'],
  });
  writeFileSync(
    join(consumerRoot, 'consumer.ts'),
    `import 'reflect-metadata';

import { Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  type AuthAdapterInterface,
  type AuthAttemptResult,
  type AuthRequest,
  RocketsModule,
  defineAuthAdapter,
} from '@concepta/rockets';
import { FirebaseAuthModule } from '@concepta/rockets-adapter-firebase';
import {
  RocketsAuthModule,
  RocketsAuthRecoveryController,
  RocketsAuthTokenController,
  type RocketsAuthOptionsExtrasInterface,
} from '@concepta/rockets-auth';
import { RocketsCoreModule } from '@concepta/rockets-core';
import {
  StandardSchemaModule,
  createStandardSchemaDto,
  createStandardSchemaResponseDto,
} from '@concepta/rockets-core/standard-schema';
import { ApiStandardSchemaResponse } from '@concepta/rockets-core/standard-schema/swagger';
import { compileDtoClass, namedZodDto } from '@concepta/rockets-core/zod';
import { FirestoreRepositoryModule } from '@concepta/rockets-repository-firestore';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { typeOrmZodEntityCompiler } from '@concepta/rockets-repository-typeorm/zod';
import { StorageModule } from '@concepta/rockets-storage';
import { StorageClient } from '@concepta/rockets-storage/core';
import { createFilesSdkDriver } from '@concepta/rockets-storage/files-sdk';
import { createFsStorageDriver } from '@concepta/rockets-storage/files-sdk/fs';
import { createProviderStorageDriver } from '@concepta/rockets-storage/files-sdk/provider';
import { createS3StorageDriver } from '@concepta/rockets-storage/files-sdk/s3';
import { createMemoryStorageDriver } from '@concepta/rockets-storage/testing';
import { z } from 'zod';

export const publicPackageSymbols = [
  FirebaseAuthModule,
  FirestoreRepositoryModule,
  RocketsAuthModule,
  RocketsAuthRecoveryController,
  RocketsAuthTokenController,
  RocketsCoreModule,
  StandardSchemaModule,
  ApiStandardSchemaResponse,
  TypeOrmRepositoryModule,
  typeOrmZodEntityCompiler,
  StorageClient,
  StorageModule,
  createFilesSdkDriver,
  createFsStorageDriver,
  createProviderStorageDriver,
  createS3StorageDriver,
  createMemoryStorageDriver,
];

export const throttlingConfig: RocketsAuthOptionsExtrasInterface['throttling'] = [
  {
    name: 'default',
    limit: 100,
    ttl: 60_000,
    getTracker: (request) => request.ip,
  },
];

export const ConsumerDto = compileDtoClass(
  z.object({ id: z.string() }),
  'ConsumerDto',
);
export const NamedConsumerDto = namedZodDto<{ id: string }>(
  z.object({ id: z.string() }),
  'NamedConsumerDto',
);
export class StandardConsumerDto extends createStandardSchemaDto(
  z.object({ id: z.string() }),
) {}
export class StandardConsumerResponseDto extends createStandardSchemaResponseDto(
  z.object({ id: z.string() }),
) {}

@Injectable()
class ConsumerAuthAdapter implements AuthAdapterInterface {
  async authenticate(_request: AuthRequest): Promise<AuthAttemptResult> {
    return { matched: false };
  }
}

@Module({
  imports: [
    StandardSchemaModule.forRoot(),
    StorageModule.forRoot({
      stores: [
        {
          name: 'consumer',
          driver: createMemoryStorageDriver(),
        },
      ],
    }),
    RocketsModule.forRoot({
      settings: {},
      auth: defineAuthAdapter(ConsumerAuthAdapter),
      disableController: { me: true },
      enableGlobalGuard: false,
    }),
  ],
})
class ConsumerModule {}

async function main(): Promise<void> {
  const app = await NestFactory.create(ConsumerModule, {
    abortOnError: false,
    logger: false,
  });
  await app.init();
  await app.close();
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
`,
  );
  writeJson(join(consumerRoot, 'tsconfig.storage-node10.json'), {
    compilerOptions: {
      module: 'CommonJS',
      moduleResolution: 'Node10',
      target: 'ES2022',
      strict: true,
      noEmit: true,
      skipLibCheck: false,
    },
    include: ['storage-node10.ts'],
  });
  writeFileSync(
    join(consumerRoot, 'storage-node10.ts'),
    `import { StorageModule } from '@concepta/rockets-storage';
import type { StorageDriver } from '@concepta/rockets-storage/core';
import type { FilesSdkDriverOptions } from '@concepta/rockets-storage/files-sdk';

type LegacyStorageSurface = readonly [
  typeof StorageModule,
  StorageDriver,
  FilesSdkDriverOptions<never>,
];

declare const legacyStorageSurface: LegacyStorageSurface;
void legacyStorageSurface;
`,
  );

  run(process.execPath, ['verify-cjs.cjs'], consumerRoot);
  run(process.execPath, ['verify-esm.mjs'], consumerRoot);
  run(
    process.execPath,
    [join(consumerRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', '.'],
    consumerRoot,
  );
  run(
    process.execPath,
    [
      join(consumerRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '-p',
      'tsconfig.storage-node10.json',
    ],
    consumerRoot,
  );
  run(process.execPath, [join('dist', 'consumer.js')], consumerRoot);

  writeJson(join(noZodConsumerRoot, 'package.json'), {
    name: 'rockets-core-no-zod-consumer-smoke',
    version: '0.0.0',
    private: true,
  });
  run(
    'npm',
    [
      'install',
      '--save-exact',
      '--legacy-peer-deps',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      coreTarball,
      '@nestjs/common@12.0.0-alpha.5',
      '@nestjs/core@12.0.0-alpha.5',
      'class-transformer@0.5.1',
      'class-validator@0.14.3',
      'reflect-metadata@0.1.14',
      'rxjs@7.8.2',
    ],
    noZodConsumerRoot,
  );
  writeFileSync(
    join(noZodConsumerRoot, 'verify-core-no-zod.cjs'),
    `'use strict';\nrequire('reflect-metadata');\nconst loaded = require('@concepta/rockets-core');\nif (!('RocketsCoreModule' in loaded)) throw new Error('Missing RocketsCoreModule from @concepta/rockets-core');\n`,
  );
  run(process.execPath, ['verify-core-no-zod.cjs'], noZodConsumerRoot);

  writeJson(join(storageProviderConsumerRoot, 'package.json'), {
    name: 'rockets-storage-provider-peer-minimal-smoke',
    version: '0.0.0',
    private: true,
    type: 'module',
  });
  run(
    'npm',
    [
      'install',
      '--save-exact',
      '--legacy-peer-deps',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      storageTarball,
      '@types/node@20.19.43',
      'typescript@5.9.3',
    ],
    storageProviderConsumerRoot,
  );
  writeJson(join(storageProviderConsumerRoot, 'tsconfig.json'), {
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      target: 'ES2022',
      strict: true,
      noEmit: true,
      skipLibCheck: false,
    },
    include: ['consumer.ts'],
  });
  writeFileSync(
    join(storageProviderConsumerRoot, 'consumer.ts'),
    `import {
  createProviderStorageDriver,
  type ProviderStorageDriverOptions,
} from '@concepta/rockets-storage/files-sdk/provider';

const options: ProviderStorageDriverOptions = {
  provider: 'fs',
  config: { root: './storage' },
};
void createProviderStorageDriver;
void options;
`,
  );
  run(
    process.execPath,
    [
      join(
        storageProviderConsumerRoot,
        'node_modules',
        'typescript',
        'bin',
        'tsc',
      ),
      '-p',
      '.',
    ],
    storageProviderConsumerRoot,
  );

  console.log(
    `Verified ${workspaces.length} packed public packages in clean CJS, ESM, TypeScript, Nest, legacy-resolution, and peer-minimal consumers.`,
  );
} finally {
  if (!temporaryRoot.startsWith(temporaryPrefix)) {
    throw new Error(`Refusing to clean unexpected path: ${temporaryRoot}`);
  }
  rmSync(temporaryRoot, { recursive: true, force: true });
}
