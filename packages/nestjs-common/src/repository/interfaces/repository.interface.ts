import { PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '../../utils/deep-partial';

import { RepositoryInternals } from './repository-internals';

export interface RepositoryInterface<Entity extends PlainLiteralObject> {
  entityName(): string;

  find(
    options?: RepositoryInternals.FindManyOptions<Entity>,
  ): Promise<Entity[]>;

  findOne(
    options: RepositoryInternals.FindOneOptions<Entity>,
  ): Promise<Entity | null>;

  create(entityLike: DeepPartial<Entity>): Entity;

  merge(mergeIntoEntity: Entity, ...entityLikes: DeepPartial<Entity>[]): Entity;

  save<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: RepositoryInternals.SaveOptions,
  ): Promise<(T & Entity)[]>;
  save<T extends DeepPartial<Entity>>(
    entity: T,
    options?: RepositoryInternals.SaveOptions,
  ): Promise<T & Entity>;

  remove(entities: Entity[]): Promise<Entity[]>;
  remove(entity: Entity): Promise<Entity>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  gt<T>(value: T): any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  gte<T>(value: T): any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  lt<T>(value: T): any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  lte<T>(value: T): any;
}
