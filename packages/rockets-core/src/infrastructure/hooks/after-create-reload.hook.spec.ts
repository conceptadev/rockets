import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { getDynamicRepositoryToken } from '@concepta/nestjs-repository';
import { AfterCreateReloadHook } from './after-create-reload.hook';
import type { EntityHookContext } from './entity-hook';

interface FakeWidget {
  id: string;
  name: string;
  /** Eager relation that `save()` doesn't return — only present after reload. */
  category?: { id: string; label: string };
}

class FakeWidgetRepo {
  lastOptions: Record<string, unknown> | undefined;

  constructor(private readonly rows: FakeWidget[]) {}

  /**
   * Stubs the `Where.eq('id', ...)` shape: walks the AST flat to extract
   * the `id` value, then returns the matching row. Keeps the test focused
   * on the hook's branching, not on Where AST internals.
   */
  async findOne(options: unknown): Promise<FakeWidget | null> {
    this.lastOptions = options as Record<string, unknown>;
    const where = (options as { where: { field?: string; value?: unknown } })
      .where;
    const id = where?.field === 'id' ? where.value : undefined;
    return this.rows.find((r) => r.id === id) ?? null;
  }
}

// Stub entity classes — fields declared so the classes structurally
// satisfy `Type<FakeWidget>` for the `.for<FakeWidget>(WidgetEntity)`
// overload picked by the generic.
class WidgetEntity {
  id!: string;
  name!: string;
}
class GadgetEntity {
  id!: string;
  name!: string;
}
class PetTagEntity {
  id!: string;
  name!: string;
}

describe('AfterCreateReloadHook.for()', () => {
  it('returns the same subclass for identical entity classes', () => {
    const A = AfterCreateReloadHook.for(WidgetEntity);
    const B = AfterCreateReloadHook.for(WidgetEntity);
    expect(A).toBe(B);
  });

  it('returns different subclasses for different entity classes', () => {
    const A = AfterCreateReloadHook.for(WidgetEntity);
    const B = AfterCreateReloadHook.for(GadgetEntity);
    expect(A).not.toBe(B);
  });

  it('names the subclass after the entity class', () => {
    const Sub = AfterCreateReloadHook.for(PetTagEntity);
    expect(Sub.name).toBe('AfterCreateReloadHook_PetTagEntity');
  });
});

describe('AfterCreateReloadHook.afterCreate', () => {
  async function buildHook(rows: FakeWidget[]): Promise<{
    hook: AfterCreateReloadHook<FakeWidget>;
    repo: FakeWidgetRepo;
  }> {
    const Sub = AfterCreateReloadHook.for<FakeWidget>(WidgetEntity);
    const repo = new FakeWidgetRepo(rows);
    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: getDynamicRepositoryToken('widget'), useValue: repo },
        Sub,
      ],
    }).compile();
    return { hook: moduleRef.get(Sub), repo };
  }

  it('returns the unchanged entity when id is missing', async () => {
    const { hook } = await buildHook([]);
    const created = { name: 'no-id' } as unknown as FakeWidget;
    const out = await hook.afterCreate(created);
    expect(out).toBe(created);
  });

  it('returns the unchanged entity when no row reloads', async () => {
    const { hook } = await buildHook([]);
    const created: FakeWidget = { id: 'w1', name: 'orig' };
    const out = await hook.afterCreate(created);
    expect(out).toBe(created);
    expect(out.category).toBeUndefined();
  });

  it('mutates the original instance with reloaded fields (eager relation populated)', async () => {
    const { hook } = await buildHook([
      {
        id: 'w1',
        name: 'reloaded-name',
        category: { id: 'c1', label: 'CategoryOne' },
      },
    ]);
    const created: FakeWidget = { id: 'w1', name: 'orig' };
    const out = await hook.afterCreate(created);
    expect(out).toBe(created); // same reference (preserve strategy)
    expect(out.category).toEqual({ id: 'c1', label: 'CategoryOne' });
    expect(out.name).toBe('reloaded-name');
  });

  /**
   * The reload must join the create's transaction. `getRepo(ctx)` on the
   * TypeORM adapter returns the transaction's repository only when the
   * context carries `TrxCtx`; without it the read goes through a
   * different `EntityManager` and, on any driver that gives a
   * transaction its own connection, cannot see the uncommitted row — the
   * eager relation then vanishes from the create response with no error.
   *
   * Asserted here rather than over HTTP because in-memory SQLite shares
   * one connection between the transaction and the default repository,
   * so an e2e passes either way.
   */
  it('forwards the hook context to the reload read', async () => {
    const { hook, repo } = await buildHook([{ id: 'w1', name: 'reloaded' }]);
    // Controlled mock of the hook context: only its identity matters
    // here, since the assertion is that the same object reaches the
    // repository rather than being dropped.
    const ctx = {
      entity: 'widget',
      operation: 'create',
      action: 'create',
      params: {},
      query: {},
      options: {},
      with: () => undefined,
      supports: () => false,
    } as unknown as EntityHookContext;

    await hook.afterCreate({ id: 'w1', name: 'orig' }, ctx);

    expect(repo.lastOptions?.ctx).toBe(ctx);
  });

  it('drops a column the read view hid — hidden columns do not reappear on create', async () => {
    // The docstring promise this pins: `created` (raw save() result)
    // carries `secret`; the reloaded read view — where a read hook
    // deleted it — does not. Assign alone cannot remove a key, so the
    // hidden column leaked on exactly the response the reload exists to
    // sanitise.
    const { hook } = await buildHook([{ id: 'w1', name: 'clean' }]);
    const created = {
      id: 'w1',
      name: 'raw',
      secret: 'MUST-NOT-REAPPEAR',
    } as unknown as FakeWidget;

    const out = (await hook.afterCreate(created)) as unknown as Record<
      string,
      unknown
    >;

    expect(out.name).toBe('clean');
    expect('secret' in out).toBe(false);
    expect(out as unknown).toBe(created);
  });
});
