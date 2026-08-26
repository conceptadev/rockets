import type { INestApplication } from '@nestjs/common';
import {
  PARAMTYPES_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { DECORATORS } from '@nestjs/swagger';
import { z } from 'zod';
import { readSchemaId } from '../utils/open-api-schema.util';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * An explicit swagger body parameter whose schema is a raw inline object —
 * the shape upstream's `CrudInitApiBody` stamps. A `$ref`, a `type`
 * (class) body, or a named body parameter is left alone.
 */
function isInlineBodyParameter(parameter: unknown): boolean {
  return (
    isRecord(parameter) &&
    parameter.in === 'body' &&
    isRecord(parameter.schema) &&
    parameter.schema.$ref === undefined
  );
}

interface RouteArgsSummary {
  /** The route has an anonymous `@Body({ schema })` with a NAMED zod schema. */
  readonly hasNamedBody: boolean;
  /** Highest parameter index any route argument occupies. */
  readonly maxIndex: number;
}

/**
 * Reads the route's `@Body` / `@Query` / `@Param` metadata. The body counts
 * only when it is anonymous and its schema is named
 * (`withOpenApi(schema, id)`) — swagger never documents `@Body('field')`.
 */
function summarizeRouteArgs(
  target: object,
  methodName: string,
): RouteArgsSummary {
  const routeArgs: unknown = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    target,
    methodName,
  );
  let hasNamedBody = false;
  let maxIndex = -1;
  if (!isRecord(routeArgs)) return { hasNamedBody, maxIndex };
  const bodyPrefix = `${RouteParamtypes.BODY}:`;
  for (const [key, param] of Object.entries(routeArgs)) {
    if (!isRecord(param)) continue;
    if (typeof param.index === 'number' && param.index > maxIndex) {
      maxIndex = param.index;
    }
    if (
      key.startsWith(bodyPrefix) &&
      param.data === undefined &&
      param.schema instanceof z.ZodType &&
      readSchemaId(param.schema) !== undefined
    ) {
      hasNamedBody = true;
    }
  }
  return { hasNamedBody, maxIndex };
}

/**
 * Swagger keys every reflected lookup (`design:paramtypes`, route
 * arguments) by `method.name`, and a method declared in a class body has
 * `name === key`. Upstream's generated handler is an anonymous function
 * assigned to the prototype (`name === ''`), so those lookups miss it —
 * the same fix the operation controller applies to its own handlers.
 */
function ensureHandlerName(handler: object, methodName: string): void {
  if (Reflect.get(handler, 'name') === methodName) return;
  Object.defineProperty(handler, 'name', { value: methodName });
}

/**
 * Swagger reads `design:paramtypes` FIRST and explores no reflected
 * parameter when the method has none. TypeScript emits that metadata for
 * a decorated class method; upstream's generated handlers are plain
 * functions assigned to the prototype, so they carry none — the same gap
 * the operation controller closes for its own handlers. `Object` per slot
 * is what `emitDecoratorMetadata` writes for an untyped parameter: the
 * body slot documents through its schema, schema-less slots are dropped.
 */
function ensureParamtypes(
  prototype: object,
  methodName: string,
  maxIndex: number,
): void {
  const existing: unknown = Reflect.getMetadata(
    PARAMTYPES_METADATA,
    prototype,
    methodName,
  );
  if (Array.isArray(existing) && existing.length > 0) return;
  Reflect.defineMetadata(
    PARAMTYPES_METADATA,
    Array.from({ length: maxIndex + 1 }, () => Object),
    prototype,
    methodName,
  );
}

/**
 * Lets a named request body reach the document converter.
 *
 * Upstream `@concepta/nestjs-crud` documents generated CRUD bodies by
 * stamping an explicit `ApiBody({ schema: <raw JSON Schema> })` on the
 * handler (conceptadev/nestjs-modules#467). Swagger merges that explicit
 * body OVER the reflected `@Body({ schema })` parameter, so the raw object
 * wins and the `${Name}CreateDto` / `UpdateDto` / `ReplaceDto` component
 * never exists — while every response and every hand-written
 * `@Body({ schema })` route is `$ref`'d through the converter.
 *
 * The validating schema is the contract, so it documents the body: for
 * every handler whose anonymous `@Body({ schema })` carries a named zod
 * schema, the explicit inline body parameter is removed before the
 * document is built. Swagger then documents the reflected parameter through
 * `standardSchemaConverter` — `$ref` to `components/schemas/<id>`, nested
 * named schemas lifted, `required: true` as before. Bodies without a
 * reflected named schema (`validation: false`, unnamed schemas, class
 * bodies) are untouched. Idempotent: a second pass finds nothing to remove.
 */
export function restoreNamedRequestBodies(app: INestApplication): void {
  const modules = app.get(ModulesContainer, { strict: false });
  const scanner = new MetadataScanner();

  for (const module of modules.values()) {
    for (const wrapper of module.controllers.values()) {
      const target: unknown = wrapper.metatype;
      if (typeof target !== 'function') continue;
      const prototype: unknown = Reflect.get(target, 'prototype');
      if (!isRecord(prototype)) continue;

      for (const methodName of scanner.getAllMethodNames(prototype)) {
        const handler: unknown = Reflect.get(prototype, methodName);
        if (typeof handler !== 'function') continue;
        const { hasNamedBody, maxIndex } = summarizeRouteArgs(
          target,
          methodName,
        );
        if (!hasNamedBody) continue;

        const explicit: unknown = Reflect.getMetadata(
          DECORATORS.API_PARAMETERS,
          handler,
        );
        if (!Array.isArray(explicit)) continue;
        const kept = explicit.filter(
          (parameter: unknown) => !isInlineBodyParameter(parameter),
        );
        if (kept.length === explicit.length) continue;
        Reflect.defineMetadata(DECORATORS.API_PARAMETERS, kept, handler);
        ensureHandlerName(handler, methodName);
        ensureParamtypes(prototype, methodName, maxIndex);
      }
    }
  }
}
