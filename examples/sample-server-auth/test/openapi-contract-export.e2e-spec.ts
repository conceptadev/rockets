import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerUiService } from '@concepta/rockets-core';
import type { OpenAPIV3 } from 'openapi-types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';

/**
 * Committed OpenAPI contract artifact (issue #54). Every CRUD zod
 * resource and `operationResource` op this sample app registers ends up
 * in this one file — the same document `openapi-contract.e2e-spec.ts`
 * already validates for structural correctness, now pinned so an
 * unintended change to the wire contract fails CI instead of only
 * showing up in a diff nobody reviewed.
 */
const contractPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../contract.json',
);

describe('sample-server-auth OpenAPI contract export (issue #54)', () => {
  let app: INestApplication;
  let document: OpenAPIV3.Document;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    await app.init();

    const swagger = app.get(SwaggerUiService);
    swagger.builder().addBearerAuth();
    document = SwaggerModule.createDocument(
      app,
      swagger.builder().build(),
    ) as OpenAPIV3.Document;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('matches the committed contract.json (regenerate with CONTRACT_UPDATE=1)', () => {
    const generated = `${JSON.stringify(document, null, 2)}\n`;

    if (process.env.CONTRACT_UPDATE === '1') {
      writeFileSync(contractPath, generated);
      return;
    }

    if (!existsSync(contractPath)) {
      throw new Error(
        `Missing ${contractPath}. Generate it with: ` +
          'CONTRACT_UPDATE=1 yarn sample-auth:contract:export',
      );
    }

    const committed = readFileSync(contractPath, 'utf8');
    expect(generated).toBe(committed);
  });
});
