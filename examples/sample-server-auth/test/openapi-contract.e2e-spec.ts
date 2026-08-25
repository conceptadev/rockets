import SwaggerParser from '@apidevtools/swagger-parser';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { OpenAPIV3 } from 'openapi-types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';
import { createSampleServerAuthOpenApiDocument } from '../src/swagger/create-openapi-document';

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

function resolvedOperationParameters(
  pathItem: OpenAPIV3.PathItemObject,
  operation: OpenAPIV3.OperationObject,
): OpenAPIV3.ParameterObject[] {
  const effective = new Map<string, OpenAPIV3.ParameterObject>();
  for (const parameter of resolvedParameters(pathItem.parameters ?? [])) {
    effective.set(`${parameter.in}:${parameter.name}`, parameter);
  }
  for (const parameter of resolvedParameters(operation.parameters ?? [])) {
    effective.set(`${parameter.in}:${parameter.name}`, parameter);
  }
  return [...effective.values()];
}

function duplicateParameterKeys(
  parameters: ReadonlyArray<
    OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
  >,
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const parameter of resolvedParameters(parameters)) {
    const key = `${parameter.in}:${parameter.name}`;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  return [...duplicates];
}

describe('sample-server-auth OpenAPI contract', () => {
  let app: INestApplication;
  let document: OpenAPIV3.Document;
  let dereferencedDocument: OpenAPIV3.Document;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    await app.init();

    // Same helper `main.ts` and the contract-export spec use: the structural
    // assertions below hold against the served document, not a lookalike.
    // `OpenAPIObject` (@nestjs/swagger) and `OpenAPIV3.Document`
    // (openapi-types) describe the same OpenAPI 3 payload in two vocabularies;
    // this app emits 3.x, so the runtime value satisfies both.
    document = createSampleServerAuthOpenApiDocument(
      app,
    ) as unknown as OpenAPIV3.Document;
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
      const parameters = resolvedOperationParameters(pathItem, operation);

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

  it('does not duplicate parameter (in, name) pairs within one list', () => {
    const violations: string[] = [];

    for (const [path, method, operation, pathItem] of operationEntries(
      dereferencedDocument,
    )) {
      for (const key of duplicateParameterKeys(pathItem.parameters ?? [])) {
        violations.push(`PATH ${path}: ${key}`);
      }
      for (const key of duplicateParameterKeys(operation.parameters ?? [])) {
        violations.push(`${method.toUpperCase()} ${path}: ${key}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('applies legal operation-level overrides to path parameters', () => {
    const inherited: OpenAPIV3.ParameterObject = {
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'string' },
    };
    const override: OpenAPIV3.ParameterObject = {
      ...inherited,
      description: 'Operation-specific identifier',
    };

    expect(
      resolvedOperationParameters(
        { parameters: [inherited] },
        { parameters: [override], responses: {} },
      ),
    ).toEqual([override]);
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
