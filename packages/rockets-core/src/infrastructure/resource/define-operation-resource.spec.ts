import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Module, Version } from '@nestjs/common';
import { Operation } from '@concepta/nestjs-core';

import { ResourceKind } from '../../domain/interfaces/resource-kind.enum';
import {
  buildAppRegistrationPlan,
  isCrudResource,
} from './aggregate-resources';
import { defineModuleResource } from './define-module-resource';
import { defineResource } from './define-resource';
import {
  defineOperationResource,
  isOperationResource,
} from './define-operation-resource';
import { validateRouteCollisions } from './planner/validate-route-collisions';
import { operationResource } from '../../zod/zod-operation-resource';
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
          method: 'POST',
          path: '',
          status: 200,
          inputDto: Input,
          outputDto: Output,
          handler: ({ input }) => {
            if (
              typeof input !== 'object' ||
              input === null ||
              !('name' in input) ||
              typeof input.name !== 'string'
            ) {
              throw new Error('EchoInput missing name');
            }
            return { name: input.name, ok: true };
          },
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

  it('rejects ops without outputDto or outputDisabled', () => {
    expect(() =>
      defineOperationResource({
        path: 'api/leak',
        operations: {
          ping: {
            key: 'ping',
            method: 'GET',
            path: '',
            status: 200,
            handler: () => ({ ok: true }),
          },
        },
      }),
    ).toThrow(/outputDto or outputDisabled/);
  });

  it('rejects status 204 with outputDto', () => {
    const Output = compileDtoClass(
      z.object({ ok: z.boolean() }),
      'NoContentOutput',
    );
    expect(() =>
      defineOperationResource({
        path: 'api/nc',
        operations: {
          clear: {
            key: 'clear',
            method: 'DELETE',
            path: '',
            status: 204,
            outputDto: Output,
            handler: () => ({ ok: true }),
          },
        },
      }),
    ).toThrow(/status 204/);
  });

  it('does not auto-register a handler already listed in providers', () => {
    class EchoHandler {
      handle() {
        return { ok: true };
      }
    }

    const bundle = defineOperationResource({
      path: 'api/echo-prov',
      providers: [
        { provide: EchoHandler, useValue: { handle: () => ({ ok: true }) } },
      ],
      operations: {
        ping: {
          key: 'ping',
          method: 'GET',
          path: '',
          status: 200,
          outputDisabled: true,
          handler: EchoHandler,
        },
      },
    });

    expect(bundle.providers).toHaveLength(1);
    expect(bundle.providers[0]).toEqual({
      provide: EchoHandler,
      useValue: expect.objectContaining({ handle: expect.any(Function) }),
    });
  });

  it('does not auto-register a handler exported by an imported module', () => {
    class ImportedHandler {
      handle() {
        return { ok: true };
      }
    }

    @Module({
      providers: [ImportedHandler],
      exports: [ImportedHandler],
    })
    class HandlerHostModule {}

    const bundle = defineOperationResource({
      path: 'api/echo-import',
      imports: [HandlerHostModule],
      operations: {
        ping: {
          key: 'ping',
          method: 'GET',
          path: '',
          status: 200,
          outputDisabled: true,
          handler: ImportedHandler,
        },
      },
    });

    expect(bundle.providers).toEqual([]);
    expect(bundle.imports).toEqual([HandlerHostModule]);
  });

  it('does not auto-register a handler exported by a DynamicModule import', () => {
    class DynHandler {
      handle() {
        return { ok: true };
      }
    }

    @Module({})
    class DynHostModule {}

    const bundle = defineOperationResource({
      path: 'api/echo-dyn',
      imports: [
        {
          module: DynHostModule,
          providers: [DynHandler],
          exports: [DynHandler],
        },
      ],
      operations: {
        ping: {
          key: 'ping',
          method: 'GET',
          path: '',
          status: 200,
          outputDisabled: true,
          handler: DynHandler,
        },
      },
    });

    expect(bundle.providers).toEqual([]);
  });
});

describe('operationResource (zod)', () => {
  it('compiles read + write into an OperationResource', () => {
    const bundle = operationResource({
      path: 'api/widgets',
      tags: ['Widgets'],
      public: true,
      operations: (op) => ({
        ping: op.read({
          path: '',
          summary: 'Ping',
          output: z.object({ ok: z.literal(true) }),
          handler: () => ({ ok: true as const }),
        }),
        shout: op.write({
          method: 'POST',
          status: 201,
          input: z.object({ text: z.string().min(1) }),
          output: z.object({ text: z.string() }),
          handler: ({ input }) => ({
            text: input.text.toUpperCase(),
          }),
        }),
      }),
    });

    expect(isOperationResource(bundle)).toBe(true);
    expect(bundle.definition.operations.ping.method).toBe('GET');
    expect(bundle.definition.operations.ping.path).toBe('');
    expect(bundle.definition.operations.shout.method).toBe('POST');
    expect(bundle.definition.operations.shout.path).toBe('shout');
    expect(bundle.definition.operations.shout.status).toBe(201);
    expect(bundle.definition.operations.shout.inputDto).toBeDefined();
    expect(bundle.definition.operations.shout.outputDto).toBeDefined();
  });

  it('defaults operation path to the key', () => {
    const bundle = operationResource({
      path: 'api/ops',
      public: true,
      operations: (op) => ({
        health: op.read({
          handler: () => ({ ok: true }),
          output: z.object({ ok: z.boolean() }),
        }),
      }),
    });
    expect(bundle.definition.operations.health.path).toBe('health');
  });

  it('rejects reserved and invalid operation keys', () => {
    expect(() =>
      operationResource({
        path: 'api/bad',
        operations: (op) => ({
          'bad-key': op.read({ output: false, handler: () => undefined }),
        }),
      }),
    ).toThrow(/not a valid identifier/);

    expect(() =>
      operationResource({
        path: 'api/bad',
        operations: (op) => ({
          constructor: op.read({ output: false, handler: () => undefined }),
        }),
      }),
    ).toThrow(/reserved/);

    expect(() =>
      operationResource({
        path: 'api/bad',
        operations: (op) => ({
          moduleRef: op.read({ output: false, handler: () => undefined }),
        }),
      }),
    ).toThrow(/reserved/);

    expect(() =>
      operationResource({
        path: 'api/bad',
        operations: (op) => ({
          toString: op.read({ output: false, handler: () => undefined }),
        }),
      }),
    ).toThrow(/reserved/);
  });

  it('rejects params keys that are not on the path', () => {
    expect(() =>
      operationResource({
        path: 'pets/:petId',
        params: z.object({ ownerId: z.uuid() }),
        operations: (op) => ({
          transfer: op.write({
            output: false,
            handler: () => undefined,
          }),
        }),
      }),
    ).toThrow(/params.ownerId/);
  });

  it('compiles paramsDto when params schema matches the path', () => {
    const bundle = operationResource({
      path: 'pets/:petId',
      params: z.object({ petId: z.uuid() }),
      public: true,
      operations: (op) => ({
        ping: op.read({
          path: '',
          output: z.object({ id: z.string() }),
          handler: ({ params }) => ({ id: params.petId }),
        }),
      }),
    });
    expect(bundle.definition.paramsDto).toBeDefined();
  });

  it('rejects 204 with an output schema', () => {
    expect(() =>
      operationResource({
        path: 'api/nc',
        public: true,
        operations: (op) => ({
          clear: op.delete({
            path: '',
            status: 204,
            output: z.object({ ok: z.boolean() }),
            handler: () => ({ ok: true }),
          }),
        }),
      }),
    ).toThrow(/status 204/);
  });

  it('allows output: false with status 204', () => {
    const bundle = operationResource({
      path: 'api/nc',
      public: true,
      operations: (op) => ({
        clear: op.delete({
          path: '',
          status: 204,
          output: false,
          handler: () => undefined,
        }),
      }),
    });
    expect(bundle.definition.operations.clear.outputDisabled).toBe(true);
    expect(bundle.definition.operations.clear.outputDto).toBeUndefined();
  });

  it('compiles delete (query-sourced) and write PUT', () => {
    const bundle = operationResource({
      path: 'api/items',
      public: true,
      operations: (op) => ({
        remove: op.delete({
          input: z.object({ force: z.coerce.boolean().optional() }),
          output: z.object({ removed: z.boolean() }),
          handler: ({ input }) => ({ removed: input.force === true }),
        }),
        replace: op.write({
          method: 'PUT',
          input: z.object({ name: z.string() }),
          output: z.object({ name: z.string() }),
          handler: ({ input }) => ({ name: input.name }),
        }),
      }),
    });

    expect(bundle.definition.operations.remove.method).toBe('DELETE');
    expect(bundle.definition.operations.remove.path).toBe('remove');
    expect(bundle.definition.operations.replace.method).toBe('PUT');
    expect(bundle.definition.operations.replace.path).toBe('replace');
  });

  it('registers through buildAppRegistrationPlan as a nest module', () => {
    const ops = operationResource({
      path: 'api/ops',
      public: true,
      operations: (op) => ({
        health: op.read({
          path: '',
          handler: () => ({ ok: true }),
          output: z.object({ ok: z.boolean() }),
        }),
      }),
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

  it('rejects cross-resource route collisions at plan time', () => {
    class WidgetEntity {
      id!: string;
    }
    const crud = defineResource({
      key: 'widget',
      entity: WidgetEntity,
      path: 'widgets',
      operations: [Operation.List, Operation.Read],
    });
    const ops = operationResource({
      path: 'widgets',
      public: true,
      operations: (op) => ({
        // GET /widgets — collides with CRUD list
        root: op.read({
          path: '',
          output: z.object({ ok: z.boolean() }),
          handler: () => ({ ok: true }),
        }),
      }),
    });

    expect(() =>
      validateRouteCollisions({
        generatedResources: [crud],
        manualResources: [],
        operationBundles: [ops],
      }),
    ).toThrow(/duplicate route GET/);
  });

  it('rejects public:false ops on a public resource at controller build', () => {
    expect(() =>
      defineOperationResource({
        path: 'api/broken',
        public: true,
        operations: {
          secret: {
            key: 'secret',
            method: 'GET',
            path: '',
            status: 200,
            public: false,
            outputDisabled: true,
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
            method: 'POST',
            path: '',
            status: 200,
            inputDto: BareDto,
            outputDisabled: true,
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
            method: 'GET',
            path: 'x',
            status: 200,
            outputDisabled: true,
            handler: () => ({ ok: true }),
          },
          b: {
            key: 'b',
            method: 'GET',
            path: 'x',
            status: 200,
            outputDisabled: true,
            handler: () => ({ ok: true }),
          },
        },
      }),
    ).toThrow(/duplicate route/);
  });

  it('rejects reserved and invalid operation keys in the lower-level factory', () => {
    expect(() =>
      defineOperationResource({
        path: 'api/bad',
        operations: {
          'bad-key': {
            key: 'bad-key',
            method: 'GET',
            path: '',
            status: 200,
            outputDisabled: true,
            handler: () => undefined,
          },
        },
      }),
    ).toThrow(/not a valid identifier/);

    expect(() =>
      defineOperationResource({
        path: 'api/bad',
        operations: {
          moduleRef: {
            key: 'moduleRef',
            method: 'GET',
            path: '',
            status: 200,
            outputDisabled: true,
            handler: () => undefined,
          },
        },
      }),
    ).toThrow(/reserved/);
  });

  it('does not reject version-separated CRUD routes when no operation resource exists', () => {
    class WidgetEntity {
      id!: string;
    }

    const v1 = {
      crud: {
        controller: {
          class: WidgetEntity,
          path: 'widgets',
          version: '1',
        },
        operations: [{ operation: Operation.List }],
      },
    };
    const v2 = {
      crud: {
        controller: {
          class: WidgetEntity,
          path: 'widgets',
          version: '2',
        },
        operations: [{ operation: Operation.List }],
      },
    };

    expect(() =>
      validateRouteCollisions({
        generatedResources: [],
        manualResources: [v1, v2],
        operationBundles: [],
      }),
    ).not.toThrow();
  });

  it('does not reject version-separated manual routes when operation resources are present', () => {
    class WidgetEntity {
      id!: string;
    }

    const v1 = {
      crud: {
        controller: {
          class: WidgetEntity,
          path: 'widgets',
          version: '1',
        },
        operations: [{ operation: Operation.List }],
      },
    };
    const v2 = {
      crud: {
        controller: {
          class: WidgetEntity,
          path: 'widgets',
          version: '2',
        },
        operations: [{ operation: Operation.List }],
      },
    };
    const ops = operationResource({
      path: 'ops',
      public: true,
      operations: (op) => ({
        health: op.read({
          output: z.object({ ok: z.boolean() }),
          handler: () => ({ ok: true }),
        }),
      }),
    });

    expect(() =>
      validateRouteCollisions({
        generatedResources: [],
        manualResources: [v1, v2],
        operationBundles: [ops],
      }),
    ).not.toThrow();
  });

  it('rejects structured static-vs-param route overlap', () => {
    class UserEntity {
      id!: string;
    }

    const crud = defineResource({
      key: 'user',
      entity: UserEntity,
      path: 'users',
      operations: [Operation.Read],
    });
    const ops = operationResource({
      path: 'users',
      public: true,
      operations: (op) => ({
        me: op.read({
          output: z.object({ ok: z.boolean() }),
          handler: () => ({ ok: true }),
        }),
      }),
    });

    expect(() =>
      validateRouteCollisions({
        generatedResources: [crud],
        manualResources: [],
        operationBundles: [ops],
      }),
    ).toThrow(/duplicate route GET/);
  });
});

/**
 * Regressions for the review findings on the operation-resource surface:
 * the documented `{ useClass }` form, transitive module re-exports,
 * operation-id / DTO-name uniqueness, and per-operation route
 * dimensions.
 */
describe('operation resource — review regressions', () => {
  class UseClassHandler {
    // Instance-field `handle` — the shape no runtime check can tell apart
    // from a plain function, which is why `{ useClass }` exists.
    handle = () => ({ ok: true });
  }

  it('accepts the documented { useClass } handler on the zod path', () => {
    expect(() =>
      operationResource({
        path: 'api/tagged',
        operations: (op) => ({
          run: op.read({
            output: z.object({ ok: z.boolean() }),
            handler: { useClass: UseClassHandler },
          }),
        }),
      }),
    ).not.toThrow();
  });

  it('registers the { useClass } target as a provider', () => {
    const bundle = operationResource({
      path: 'api/tagged-provider',
      operations: (op) => ({
        run: op.read({
          output: z.object({ ok: z.boolean() }),
          handler: { useClass: UseClassHandler },
        }),
      }),
    });

    expect(bundle.providers).toContain(UseClassHandler);
  });

  it('rejects a handler that is neither function, class nor { useClass }', () => {
    expect(() =>
      operationResource({
        path: 'api/bad-handler',
        operations: (op) => ({
          run: op.read({
            output: z.object({ ok: z.boolean() }),
            // Deliberately malformed: the definition must fail fast
            // rather than produce a controller that throws per request.
            handler: { nope: true } as never,
          }),
        }),
      }),
    ).toThrow(/must be a function, an injectable class, or/);
  });

  // Nest re-exports transitively: `exports: [InnerModule]` publishes
  // everything Inner exports. Reading only direct entries made the
  // handler look unsupplied, so it was registered locally — shadowing
  // the imported provider and losing its module-private dependencies.
  it('sees a handler exported through a re-exported module', () => {
    class TransitiveHandler {
      handle() {
        return { ok: true };
      }
    }

    @Module({
      providers: [TransitiveHandler],
      exports: [TransitiveHandler],
    })
    class InnerModule {}

    @Module({ imports: [InnerModule], exports: [InnerModule] })
    class OuterModule {}

    const bundle = operationResource({
      path: 'api/transitive',
      imports: [OuterModule],
      operations: (op) => ({
        run: op.read({
          output: z.object({ ok: z.boolean() }),
          handler: TransitiveHandler,
        }),
      }),
    });

    expect(bundle.providers).not.toContain(TransitiveHandler);
  });

  it('sees a handler re-exported through a dynamic module', () => {
    class DynamicHandler {
      handle() {
        return { ok: true };
      }
    }

    @Module({ providers: [DynamicHandler], exports: [DynamicHandler] })
    class InnerDynamicModule {}

    const bundle = operationResource({
      path: 'api/transitive-dynamic',
      imports: [
        {
          module: class OuterDynamicModule {},
          imports: [InnerDynamicModule],
          exports: [InnerDynamicModule],
        },
      ],
      operations: (op) => ({
        run: op.read({
          output: z.object({ ok: z.boolean() }),
          handler: DynamicHandler,
        }),
      }),
    });

    expect(bundle.providers).not.toContain(DynamicHandler);
  });

  // Same base path, same method, same key — distinct only by explicit
  // path. Both used to receive one operation ID and one DTO name, so
  // Swagger pointed both routes at a single component.
  it('discriminates operation ids and DTO names by explicit path', () => {
    const build = (path: string) =>
      operationResource({
        path: 'same-base',
        operations: (op) => ({
          action: op.read({
            path,
            output: z.object({ value: z.string() }),
            handler: () => ({ value: path }),
          }),
        }),
      });

    const one = build('one');
    const two = build('two');

    const oneDto = one.definition.operations.action.outputDto?.name;
    const twoDto = two.definition.operations.action.outputDto?.name;
    expect(oneDto).toBeDefined();
    expect(oneDto).not.toBe(twoDto);
  });

  it('keeps the short name when the path is just the key', () => {
    const bundle = operationResource({
      path: 'plain',
      operations: (op) => ({
        action: op.read({
          output: z.object({ value: z.string() }),
          handler: () => ({ value: 'x' }),
        }),
      }),
    });

    expect(bundle.definition.operations.action.outputDto?.name).toBe(
      'Plain_Get_ActionOutput',
    );
  });
});

/**
 * A CRUD route on version 1 and an operation route on version 2 share a
 * METHOD and a path but are routed separately by Nest. The collision
 * validator discarded operation-level dimensions, so it rejected a
 * configuration that works.
 */
describe('operation resource — route dimensions', () => {
  class VersionedEntity {
    id!: string;
  }

  it('accepts a versioned operation beside a same-path v1 CRUD route', () => {
    const crudV1 = {
      crud: {
        controller: {
          class: VersionedEntity,
          path: 'widgets',
          version: '1',
        },
        operations: [{ operation: Operation.List }],
      },
    };

    const ops = operationResource({
      path: 'widgets',
      operations: (op) => ({
        list: op.read({
          path: '',
          // Nest's `Version` is a METHOD decorator (it always writes to
          // `descriptor.value`), so per-operation `decorators` is where
          // it belongs. The planner reads it back off the generated
          // controller's handler.
          decorators: [Version('2')],
          output: z.object({ ok: z.boolean() }),
          handler: () => ({ ok: true }),
        }),
      }),
    });

    expect(() =>
      validateRouteCollisions({
        generatedResources: [],
        manualResources: [crudV1],
        operationBundles: [ops],
      }),
    ).not.toThrow();
  });

  it('still rejects two unversioned routes on the same path', () => {
    const crud = defineResource<VersionedEntity>({
      key: 'widget',
      entity: VersionedEntity,
      path: 'widgets',
      tags: ['Widgets'],
      operations: { list: {} },
    });

    const ops = operationResource({
      path: 'widgets',
      operations: (op) => ({
        list: op.read({
          path: '',
          output: z.object({ ok: z.boolean() }),
          handler: () => ({ ok: true }),
        }),
      }),
    });

    expect(() =>
      validateRouteCollisions({
        generatedResources: [crud],
        manualResources: [],
        operationBundles: [ops],
      }),
    ).toThrow(/duplicate route/i);
  });
});
