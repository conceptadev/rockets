import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ResourceKind } from '../../domain/interfaces/resource-kind.enum';
import {
  buildAppRegistrationPlan,
  isCrudResource,
} from './aggregate-resources';
import { defineModuleResource } from './define-module-resource';
import {
  defineOperationResource,
  isOperationResource,
} from './define-operation-resource';
import {
  command,
  operationResource,
  query,
} from '../../zod/zod-operation-resource';
import { compileDtoClass } from '../../zod/zod-dto';

describe('defineOperationResource', () => {
  it('builds an OperationResource with a generated controller', () => {
    const Input = compileDtoClass(z.object({ name: z.string() }), 'EchoInput');
    const Output = compileDtoClass(
      z.object({ name: z.string(), ok: z.boolean() }),
      'EchoOutput',
    );

    const bundle = defineOperationResource({
      path: 'api/echo',
      tags: ['Echo'],
      operations: {
        echo: {
          key: 'echo',
          kind: 'command',
          method: 'POST',
          path: '',
          status: 200,
          inputDto: Input,
          outputDto: Output,
          handler: ({ input }) => ({
            name: (input as { name: string }).name,
            ok: true,
          }),
        },
      },
    });

    expect(isOperationResource(bundle)).toBe(true);
    expect(bundle.kind).toBe(ResourceKind.Operation);
    expect(bundle.controller).toBeTypeOf('function');
    expect(bundle.definition.operations.echo.method).toBe('POST');
  });

  it('refuses an empty operations map', () => {
    expect(() =>
      defineOperationResource({ path: 'api/empty', operations: {} }),
    ).toThrow(/at least one operation/);
  });
});

describe('operationResource (zod)', () => {
  it('compiles query + command into an OperationResource', () => {
    const bundle = operationResource({
      path: 'api/widgets',
      tags: ['Widgets'],
      public: true,
      operations: {
        ping: query({
          summary: 'Ping',
          output: z.object({ ok: z.literal(true) }),
          handler: () => ({ ok: true as const }),
        }),
        shout: command({
          method: 'POST',
          path: 'shout',
          status: 201,
          input: z.object({ text: z.string().min(1) }),
          output: z.object({ text: z.string() }),
          handler: ({ input }) => ({
            text: input.text.toUpperCase(),
          }),
        }),
      },
    });

    expect(isOperationResource(bundle)).toBe(true);
    expect(bundle.definition.operations.ping.method).toBe('GET');
    expect(bundle.definition.operations.shout.method).toBe('POST');
    expect(bundle.definition.operations.shout.status).toBe(201);
    expect(bundle.definition.operations.shout.inputDto).toBeDefined();
    expect(bundle.definition.operations.shout.outputDto).toBeDefined();
  });

  it('registers through buildAppRegistrationPlan as a nest module', () => {
    const ops = operationResource({
      path: 'api/ops',
      public: true,
      operations: {
        health: query({
          handler: () => ({ ok: true }),
          output: z.object({ ok: z.boolean() }),
        }),
      },
    });
    const moduleSlice = defineModuleResource({
      providers: [],
    });

    const plan = buildAppRegistrationPlan({
      resources: [ops, moduleSlice],
    });

    expect(plan.nestModules).toHaveLength(2);
    expect(plan.crudResources).toHaveLength(0);
    expect(isCrudResource(ops)).toBe(false);
  });

  it('rejects public:false ops on a public resource at controller build', () => {
    expect(() =>
      defineOperationResource({
        path: 'api/broken',
        public: true,
        operations: {
          secret: {
            key: 'secret',
            kind: 'query',
            method: 'GET',
            path: '',
            status: 200,
            public: false,
            handler: () => ({ ok: true }),
          },
        },
      }),
    ).toThrow(/cannot be more private/);
  });

  it('rejects DTOs without Standard Schema or class-validator metadata', () => {
    class BareDto {}
    expect(() =>
      defineOperationResource({
        path: 'api/bare',
        operations: {
          echo: {
            key: 'echo',
            kind: 'command',
            method: 'POST',
            path: '',
            status: 200,
            inputDto: BareDto,
            handler: () => ({ ok: true }),
          },
        },
      }),
    ).toThrow(/neither a Standard Schema nor class-validator/);
  });

  it('rejects duplicate method+path pairs', () => {
    expect(() =>
      defineOperationResource({
        path: 'api/dup',
        operations: {
          a: {
            key: 'a',
            kind: 'query',
            method: 'GET',
            path: 'x',
            status: 200,
            handler: () => ({ ok: true }),
          },
          b: {
            key: 'b',
            kind: 'query',
            method: 'GET',
            path: 'x',
            status: 200,
            handler: () => ({ ok: true }),
          },
        },
      }),
    ).toThrow(/duplicate route/);
  });
});
