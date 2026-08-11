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

const consumerDependencies = [
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

  writeJson(join(consumerRoot, 'package.json'), {
    name: 'rockets-packed-consumer-smoke',
    version: '0.0.0',
    private: true,
  });

  // Nest 12.0.0-alpha.5 still advertises Nest 11 peers internally, so npm's
  // strict resolver rejects the otherwise intentional alpha stack. Install
  // every required peer explicitly, then bypass only that upstream metadata
  // conflict; runtime imports, type checking, and app bootstrap remain gated.
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
    ['@concepta/rockets-core/zod', 'compileDtoClass'],
    ['@concepta/rockets-core/zod', 'namedZodDto'],
    ['@concepta/rockets-repository-firestore', 'FirestoreRepositoryModule'],
    ['@concepta/rockets-repository-typeorm', 'TypeOrmRepositoryModule'],
    ['@concepta/rockets-repository-typeorm/zod', 'typeOrmZodEntityCompiler'],
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
import { compileDtoClass, namedZodDto } from '@concepta/rockets-core/zod';
import { FirestoreRepositoryModule } from '@concepta/rockets-repository-firestore';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { typeOrmZodEntityCompiler } from '@concepta/rockets-repository-typeorm/zod';
import { z } from 'zod';

export const publicPackageSymbols = [
  FirebaseAuthModule,
  FirestoreRepositoryModule,
  RocketsAuthModule,
  RocketsAuthRecoveryController,
  RocketsAuthTokenController,
  RocketsCoreModule,
  TypeOrmRepositoryModule,
  typeOrmZodEntityCompiler,
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

@Injectable()
class ConsumerAuthAdapter implements AuthAdapterInterface {
  async authenticate(_request: AuthRequest): Promise<AuthAttemptResult> {
    return { matched: false };
  }
}

@Module({
  imports: [
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

  run(process.execPath, ['verify-cjs.cjs'], consumerRoot);
  run(process.execPath, ['verify-esm.mjs'], consumerRoot);
  run(
    process.execPath,
    [join(consumerRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', '.'],
    consumerRoot,
  );
  run(process.execPath, [join('dist', 'consumer.js')], consumerRoot);

  console.log(
    `Verified ${workspaces.length} packed public packages in a clean CJS, ESM, TypeScript, and Nest consumer.`,
  );
} finally {
  if (!temporaryRoot.startsWith(temporaryPrefix)) {
    throw new Error(`Refusing to clean unexpected path: ${temporaryRoot}`);
  }
  rmSync(temporaryRoot, { recursive: true, force: true });
}
