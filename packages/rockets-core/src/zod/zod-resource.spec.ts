import { describe, it, expect } from 'vitest';
import type { PlainLiteralObject, Type } from '@nestjs/common';
import { z } from 'zod';
import type { SchemaEntityCompiler } from '../common';
import { OwnerScopeHook, OwnerStampHook } from '../index';
import { f } from './fields';
import { zodResource } from './zod-resource';

/**
 * HIGH CWE-863: an owner-annotated schema must scope reads as well as
 * stamp writes. `zodResource` wires `OwnerScopeHook` alongside
 * `OwnerStampHook` unless the resource opts out via `ownerScope: false`.
 */
describe('zodResource owner-scope auto-wire (HIGH CWE-863)', () => {
  const compiler: SchemaEntityCompiler = {
    compileEntity: (_schema, options) => {
      class GeneratedEntity {}
      Object.defineProperty(GeneratedEntity, 'name', { value: options.name });
      return GeneratedEntity as Type<PlainLiteralObject>;
    },
  };

  const isStamp = (hook: Type): boolean =>
    hook.prototype instanceof OwnerStampHook;
  const isScope = (hook: Type): boolean =>
    hook.prototype instanceof OwnerScopeHook;

  const ownerSchema = z.object({
    id: f.pk(),
    userId: f.owner(),
    name: f.string(),
  });

  it('auto-wires OwnerScopeHook when f.owner() is present (opt-out, not opt-in)', () => {
    const resource = zodResource({
      name: 'Pet',
      schema: ownerSchema,
      entityCompiler: compiler,
      operations: ['list', 'create'],
    });

    const hooks = (resource.core.providers ?? []).filter(
      (p): p is Type => typeof p === 'function',
    );

    expect(hooks.some(isStamp)).toBe(true);
    expect(hooks.some(isScope)).toBe(true);
  });

  it('omits OwnerScopeHook when ownerScope is explicitly false', () => {
    const resource = zodResource({
      name: 'Pet',
      schema: ownerSchema,
      entityCompiler: compiler,
      operations: ['list', 'create'],
      ownerScope: false,
    });

    const hooks = (resource.core.providers ?? []).filter(
      (p): p is Type => typeof p === 'function',
    );

    expect(hooks.some(isStamp)).toBe(true);
    expect(hooks.some(isScope)).toBe(false);
  });
});

/**
 * Per-operation `input` / `output` (issue #57). The behavioural half is
 * pinned by `rockets-core-zod-operation-io.e2e-spec.ts`; these cover the
 * boot-time rejections, which exist so an override core cannot honour
 * fails loudly instead of being dropped on the wire.
 */
describe('zodResource per-operation input/output validation', () => {
  const compiler: SchemaEntityCompiler = {
    compileEntity: (_schema, options) => {
      class GeneratedEntity {}
      Object.defineProperty(GeneratedEntity, 'name', { value: options.name });
      return GeneratedEntity as Type<PlainLiteralObject>;
    },
  };

  const schema = z.object({
    id: f.pk(),
    name: f.string(),
    dateDeleted: f.deletedAt(),
  });

  const build =
    (operations: Parameters<typeof zodResource>[0]['operations']) => () =>
      zodResource({
        name: 'Pet',
        schema,
        entityCompiler: compiler,
        operations,
      });

  it('accepts input on create and output on read', () => {
    expect(
      build({
        read: { output: z.object({ id: z.uuid() }) },
        create: { input: z.object({ name: z.string() }) },
      }),
    ).not.toThrow();
  });

  it('rejects input on an operation with no request body', () => {
    expect(
      build({ list: { input: z.object({ name: z.string() }) } }),
    ).toThrowError(/has no request body/);
  });

  it('rejects input on read even though read has a path param', () => {
    expect(
      build({ read: { input: z.object({ name: z.string() }) } }),
    ).toThrowError(/Only create\/update\/replace/);
  });

  it('rejects output on a delete that answers 204', () => {
    expect(
      build({
        read: true,
        delete: { soft: true, output: z.object({ id: z.uuid() }) },
      }),
    ).toThrowError(/returnDeleted/);
  });

  it('accepts output on a delete that returns the deleted row', () => {
    expect(
      build({
        read: true,
        delete: {
          soft: true,
          returnDeleted: true,
          output: z.object({ id: z.uuid() }),
        },
      }),
    ).not.toThrow();
  });

  it('rejects output on a restore that answers 204', () => {
    expect(
      build({
        read: true,
        delete: { soft: true },
        restore: { output: z.object({ id: z.uuid() }) },
      }),
    ).toThrowError(/returnRestored/);
  });
});
