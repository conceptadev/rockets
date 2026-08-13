import { randomUUID } from 'crypto';
import { AppContextHost, type DeepPartial } from '@concepta/nestjs-core';
import {
  isWhereCondition,
  RepositoryAdapter,
  SortOrder,
  TrxCtx,
  type RepositoryCreateOptions,
  type RepositoryDeleteOptions,
  type RepositoryFindOneOptions,
  type RepositoryFindOptions,
  type RepositoryMetadataInterface,
  type RepositoryRestoreOptions,
  type RepositoryUpdateOptions,
  type RepositoryUpsertOptions,
  type WhereClause,
} from '@concepta/nestjs-repository';
import type { PlainLiteralObject } from '@nestjs/common';

import {
  FIRESTORE_ALT_SOFT_DELETE_FIELD,
  FIRESTORE_DEFAULT_SOFT_DELETE_FIELD,
} from '../constants/firestore-soft-delete.constants';
import { FIRESTORE_DEFAULT_TRANSACTION_KEY } from '../constants/firestore-transaction.constants';
import type { FirestoreBackend } from '../interfaces/firestore-backend.interface';
import type {
  FirestoreOrderBy,
  FirestoreQueryRequest,
} from '../interfaces/firestore-query.interface';
import type { FirestoreTransactionHandle } from '../interfaces/firestore-transaction-handle.interface';
import { resolveSoftDeleteFieldFromMetadata } from './firestore-entity-metadata';
import { runFirestoreCount, runFirestoreQuery } from './firestore-query-runner';
import { translateDnfBranch } from './firestore-where.translator';
import { getAmbientFirestoreTransaction } from '../transaction/firestore-transaction-context';

export interface FirestoreRepositoryOptions<Entity extends PlainLiteralObject> {
  readonly entityKey: string;
  readonly collection: string;
  readonly metadata: RepositoryMetadataInterface<Entity>;
  readonly backend: FirestoreBackend;
  readonly transactionKey?: string;
}

type StoreClient = Pick<
  FirestoreBackend,
  'get' | 'create' | 'set' | 'delete' | 'queryBranch' | 'countBranch'
>;

export class FirestoreRepository<
  Entity extends PlainLiteralObject,
> extends RepositoryAdapter<Entity> {
  readonly metadata: RepositoryMetadataInterface<Entity>;
  private readonly softDeleteField?: string;
  private readonly transactionKey: string;

  constructor(private readonly options: FirestoreRepositoryOptions<Entity>) {
    super(options.entityKey);
    this.metadata = options.metadata;
    this.softDeleteField = resolveSoftDeleteFieldFromMetadata(options.metadata);
    this.transactionKey =
      options.transactionKey ?? FIRESTORE_DEFAULT_TRANSACTION_KEY;
  }

  protected async doFind(
    options?: RepositoryFindOptions<Entity>,
  ): Promise<Entity[]> {
    const client = await this.resolveClient(options?.ctx);
    const rows = await runFirestoreQuery(
      client,
      this.options.collection,
      this.buildQueryRequest(options),
    );
    return rows.map((row) => this.fromStore(row));
  }

  protected async doFindOne(
    options: RepositoryFindOneOptions<Entity>,
  ): Promise<Entity | null> {
    const rows = await this.doFind({ ...options, take: 1 });
    return rows[0] ?? null;
  }

  protected async doCount(
    options?: RepositoryFindOptions<Entity>,
  ): Promise<number> {
    const client = await this.resolveClient(options?.ctx);
    const request = this.buildQueryRequest(options);
    return runFirestoreCount(client, this.options.collection, {
      branches: request.branches,
      withDeleted: request.withDeleted,
      softDeleteField: request.softDeleteField,
    });
  }

  protected async doFindAndCount(
    options?: RepositoryFindOptions<Entity>,
  ): Promise<[Entity[], number]> {
    const client = await this.resolveClient(options?.ctx);
    const request = this.buildQueryRequest(options);
    const [rows, total] = await Promise.all([
      runFirestoreQuery(client, this.options.collection, request),
      runFirestoreCount(client, this.options.collection, {
        branches: request.branches,
        withDeleted: request.withDeleted,
        softDeleteField: request.softDeleteField,
      }),
    ]);
    return [rows.map((row) => this.fromStore(row)), total];
  }

  protected async doCreate(
    entity: DeepPartial<Entity>,
    options?: RepositoryCreateOptions,
  ): Promise<Entity> {
    const client = await this.resolveClient(options?.ctx);
    const id = this.resolveId(entity);
    const stored = this.toStore({ ...entity, id } as DeepPartial<Entity>);
    await client.create(this.options.collection, id, stored);
    this.markDirty(options?.ctx);
    return this.fromStore(stored);
  }

  protected async doCreateMany(
    entities: DeepPartial<Entity>[],
    options?: RepositoryCreateOptions,
  ): Promise<Entity[]> {
    const created: Entity[] = [];
    for (const entity of entities) {
      created.push(await this.doCreate(entity, options));
    }
    return created;
  }

  protected async doUpdate(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity> {
    const client = await this.resolveClient(options?.ctx);
    const id = this.resolveId(entity);
    const merged = this.toStore({ ...entity, ...data, id });
    await client.set(this.options.collection, id, merged, true);
    this.markDirty(options?.ctx);
    return this.fromStore(merged);
  }

  protected async doUpsert(
    entity: DeepPartial<Entity>,
    options?: RepositoryUpsertOptions,
  ): Promise<Entity> {
    const client = await this.resolveClient(options?.ctx);
    const id = this.resolveId(entity);
    const stored = this.toStore({ ...entity, id } as DeepPartial<Entity>);
    await client.set(this.options.collection, id, stored, true);
    this.markDirty(options?.ctx);
    return this.fromStore(stored);
  }

  protected async doReplace(
    entity: Entity,
    data: DeepPartial<Entity>,
    options?: RepositoryUpdateOptions,
  ): Promise<Entity> {
    const client = await this.resolveClient(options?.ctx);
    const id = this.resolveId(entity);
    const stored = this.toStore({ ...data, id });
    await client.set(this.options.collection, id, stored, false);
    this.markDirty(options?.ctx);
    return this.fromStore(stored);
  }

  protected async doDelete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity> {
    const client = await this.resolveClient(options?.ctx);
    const id = this.resolveId(entity);
    await client.delete(this.options.collection, id);
    this.markDirty(options?.ctx);
    return entity;
  }

  protected async doDeleteMany(
    entities: Entity[],
    options?: RepositoryDeleteOptions,
  ): Promise<Entity[]> {
    for (const entity of entities) {
      await this.doDelete(entity, options);
    }
    return entities;
  }

  protected async doSoftDelete(
    entity: Entity,
    options?: RepositoryDeleteOptions,
  ): Promise<Entity> {
    const field = this.requireSoftDeleteField();
    const client = await this.resolveClient(options?.ctx);
    const id = this.resolveId(entity);
    const removedAt = new Date();
    const patch = { [field]: removedAt } as DeepPartial<Entity>;
    const merged = this.toStore({ ...entity, ...patch, id });
    await client.set(this.options.collection, id, merged, true);
    this.markDirty(options?.ctx);
    return this.fromStore(merged);
  }

  protected async doRestore(
    entity: Entity,
    options?: RepositoryRestoreOptions,
  ): Promise<Entity> {
    const field = this.requireSoftDeleteField();
    const client = await this.resolveClient(options?.ctx);
    const id = this.resolveId(entity);
    const patch = { [field]: null } as DeepPartial<Entity>;
    const merged = this.toStore({ ...entity, ...patch, id });
    await client.set(this.options.collection, id, merged, true);
    this.markDirty(options?.ctx);
    return this.fromStore(merged);
  }

  transform(entityLike: DeepPartial<Entity>): Entity {
    return { ...entityLike } as Entity;
  }

  merge(
    mergeIntoEntity: Entity,
    ...entityLikes: DeepPartial<Entity>[]
  ): Entity {
    return Object.assign(mergeIntoEntity, ...entityLikes);
  }

  private async resolveClient(ctx?: PlainLiteralObject): Promise<StoreClient> {
    const handle = await this.resolveTransactionHandle(ctx);
    return handle ?? this.options.backend;
  }

  private async resolveTransactionHandle(
    ctx?: PlainLiteralObject,
  ): Promise<FirestoreTransactionHandle | null> {
    // Callback-scoped API (runInFirestoreTransaction) — preferred under contention.
    const ambient = getAmbientFirestoreTransaction();
    if (ambient !== undefined) {
      return ambient;
    }

    // Imperative TransactionScope bridge — fail-closed on Firestore retry.
    const context = AppContextHost.from(ctx);
    if (!context.supports(TrxCtx)) {
      return null;
    }
    const { trx } = context.with(TrxCtx);
    if (!trx?.isSupported) {
      return null;
    }
    const tx = await trx.getOrStart(this.transactionKey);
    return tx.getClient<FirestoreTransactionHandle>();
  }

  private markDirty(ctx?: PlainLiteralObject): void {
    // Ambient callback transactions commit when runTransaction returns —
    // no dirty flag to track.
    if (getAmbientFirestoreTransaction() !== undefined) {
      return;
    }
    const context = AppContextHost.from(ctx);
    if (!context.supports(TrxCtx)) {
      return;
    }
    const { trx } = context.with(TrxCtx);
    if (!trx?.isSupported) {
      return;
    }
    const tx = trx.get(this.transactionKey);
    tx?.markDirty();
  }

  private buildQueryRequest(
    options?: RepositoryFindOptions<Entity>,
  ): FirestoreQueryRequest {
    return {
      branches: this.resolveBranches(options?.where),
      orderBy: mapOrderBy(options?.order),
      skip: options?.skip,
      take: options?.take,
      withDeleted: options?.withDeleted,
      softDeleteField: this.softDeleteField,
    };
  }

  private resolveBranches(where?: WhereClause) {
    if (!where) {
      return [{ filters: [], postFilters: [] }];
    }
    return this.toDnf(where).map((conditions) =>
      translateDnfBranch(conditions.filter(isWhereCondition)),
    );
  }

  private requireSoftDeleteField(): string {
    if (!this.softDeleteField) {
      throw new Error(
        `Firestore adapter: entity "${this.options.entityKey}" has no soft-delete column — add "${FIRESTORE_DEFAULT_SOFT_DELETE_FIELD}" or "${FIRESTORE_ALT_SOFT_DELETE_FIELD}" to the class.`,
      );
    }
    return this.softDeleteField;
  }

  private resolveId(entity: DeepPartial<Entity> | Entity): string {
    const candidate = (entity as { readonly id?: string }).id;
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
    return randomUUID();
  }

  /**
   * `Date` values are handed to the backend AS DATES. Firestore has a
   * native `Timestamp` type and the admin SDK maps `Date` onto it both
   * ways, so the type survives the round trip and no reconstruction is
   * needed on read.
   *
   * This used to write `value.toISOString()`, which threw the type away
   * — and `fromStore` then tried to guess it back from the field name
   * (`startsWith('date') || endsWith('At')`). That made the returned
   * TYPE depend on the field NAME: `dateCreated` came back a `Date`,
   * `birthday` and `validFrom` came back strings.
   */
  private toStore(entity: DeepPartial<Entity>): Record<string, unknown> {
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(entity)) {
      if (value === undefined) {
        continue;
      }
      next[key] = value;
    }
    const id = (entity as { readonly id?: string }).id;
    if (typeof id === 'string') {
      next.id = id;
    }
    return next;
  }

  private fromStore(row: Record<string, unknown>): Entity {
    return { ...row } as Entity;
  }
}

function mapOrderBy<Entity extends PlainLiteralObject>(
  order?: RepositoryFindOptions<Entity>['order'],
): FirestoreOrderBy[] | undefined {
  if (!order || order.length === 0) {
    return undefined;
  }
  return order.map((clause) => ({
    field: clause.field,
    direction: clause.order === SortOrder.DESC ? 'desc' : 'asc',
  }));
}

/** Narrows to this adapter instance (e.g. for Firestore-only helpers). */
export function isFirestoreRepository<Entity extends PlainLiteralObject>(
  repo: unknown,
): repo is FirestoreRepository<Entity> {
  return repo instanceof FirestoreRepository;
}
