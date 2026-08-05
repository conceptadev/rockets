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
