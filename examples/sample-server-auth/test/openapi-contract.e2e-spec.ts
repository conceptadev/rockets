import SwaggerParser from '@apidevtools/swagger-parser';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerUiService } from '@concepta/rockets-core';
import type { OpenAPIV3 } from 'openapi-types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';

const HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const;

type HttpMethod = (typeof HTTP_METHODS)[number];

function isReferenceObject(
  value: OpenAPIV3.ReferenceObject | object,
): value is OpenAPIV3.ReferenceObject {
  return '$ref' in value;
}

function operationEntries(
  document: OpenAPIV3.Document,
): ReadonlyArray<
  readonly [
    string,
    HttpMethod,
    OpenAPIV3.OperationObject,
    OpenAPIV3.PathItemObject,
  ]
> {
  const operations: Array<
    readonly [
      string,
      HttpMethod,
      OpenAPIV3.OperationObject,
      OpenAPIV3.PathItemObject,
    ]
  > = [];

  for (const [path, pathItem] of Object.entries(document.paths)) {
    if (pathItem === undefined) continue;
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation !== undefined) {
        operations.push([path, method, operation, pathItem]);
      }
    }
  }

  return operations;
}

function resolvedParameters(
  parameters: ReadonlyArray<
    OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
  >,
): OpenAPIV3.ParameterObject[] {
  return parameters.map((parameter) => {
    if (isReferenceObject(parameter)) {
      throw new Error(
        `Unresolved OpenAPI parameter reference: ${parameter.$ref}`,
      );
    }
    return parameter;
  });
}

describe('sample-server-auth OpenAPI contract', () => {
  let app: INestApplication;
  let document: OpenAPIV3.Document;
  let dereferencedDocument: OpenAPIV3.Document;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    await app.init();

    const swagger = app.get(SwaggerUiService);
    swagger.builder().addBearerAuth();
    document = SwaggerModule.createDocument(
      app,
      swagger.builder().build(),
    ) as OpenAPIV3.Document;
    dereferencedDocument = (await SwaggerParser.dereference(
      structuredClone(document),
    )) as OpenAPIV3.Document;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('is a valid complete OpenAPI document', async () => {
    await expect(SwaggerParser.validate(document)).resolves.toBeDefined();
  });

  it('declares exactly one required path parameter per placeholder', () => {
    const violations: string[] = [];

    for (const [path, method, operation, pathItem] of operationEntries(
      dereferencedDocument,
    )) {
      const placeholders = new Set(
        [...path.matchAll(/\{([^}]+)\}/g)].map(([, name]) => name),
      );
      const parameters = resolvedParameters([
        ...(pathItem.parameters ?? []),
        ...(operation.parameters ?? []),
      ]);

      for (const placeholder of placeholders) {
        const matches = parameters.filter(
          (parameter) =>
            parameter.in === 'path' &&
            parameter.name === placeholder &&
            parameter.required === true,
        );
        if (matches.length !== 1) {
          violations.push(
            `${method.toUpperCase()} ${path}: {${placeholder}} has ${
              matches.length
            } matching required path parameters`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('does not duplicate parameter (in, name) pairs', () => {
    const violations: string[] = [];

    for (const [path, method, operation, pathItem] of operationEntries(
      dereferencedDocument,
    )) {
      const seen = new Set<string>();
      const parameters = resolvedParameters([
        ...(pathItem.parameters ?? []),
        ...(operation.parameters ?? []),
      ]);
      for (const parameter of parameters) {
        const key = `${parameter.in}:${parameter.name}`;
        if (seen.has(key)) {
          violations.push(`${method.toUpperCase()} ${path}: ${key}`);
        }
        seen.add(key);
      }
    }

    expect(violations).toEqual([]);
  });

  it('does not mix OpenAPI 2 schema with OpenAPI 3 response content', () => {
    const violations: string[] = [];

    for (const [path, method, operation] of operationEntries(
      dereferencedDocument,
    )) {
      for (const [status, response] of Object.entries(operation.responses)) {
        if (isReferenceObject(response)) {
          violations.push(
            `${method.toUpperCase()} ${path}: unresolved response ${status}`,
          );
        } else if ('schema' in response && response.content !== undefined) {
          violations.push(
            `${method.toUpperCase()} ${path}: response ${status}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
