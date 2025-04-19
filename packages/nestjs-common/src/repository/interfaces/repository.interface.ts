import { PlainLiteralObject } from '@nestjs/common';

import { DeepPartial } from '../../utils/deep-partial';

import { RepositoryInternals } from './repository-internals';

export interface RepositoryInterface<Entity extends PlainLiteralObject> {
  metadata: { name: string; targetName: string };

  find(
    options?: RepositoryInternals.FindManyOptions<Entity>,
  ): Promise<Entity[]>;

  findBy(
    where:
      | RepositoryInternals.FindOptionsWhere<Entity>
      | RepositoryInternals.FindOptionsWhere<Entity>[],
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

  update(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | RepositoryInternals.FindOptionsWhere<Entity>,
    partialEntity: RepositoryInternals.QueryDeepPartialEntity<Entity>,
  ): Promise<RepositoryInternals.UpdateResult>;

  remove(
    entities: Entity[],
    options?: RepositoryInternals.RemoveOptions,
  ): Promise<Entity[]>;
  remove(
    entity: Entity,
    options?: RepositoryInternals.RemoveOptions,
  ): Promise<Entity>;

  delete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | RepositoryInternals.FindOptionsWhere<Entity>,
  ): Promise<RepositoryInternals.DeleteResult>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  gt<T>(value: T): any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  gte<T>(value: T): any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  lt<T>(value: T): any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  lte<T>(value: T): any;
}
