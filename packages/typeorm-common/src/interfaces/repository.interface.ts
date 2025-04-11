import {
  DeepPartial,
  FindOneOptions,
  ObjectLiteral,
  Repository,
  SaveOptions,
} from 'typeorm';

export interface RepositoryInterface<Entity extends ObjectLiteral>
  extends Pick<
    Repository<Entity>,
    | 'update'
    // | 'create'
    // | 'save'
    | 'count'
    | 'remove'
    | 'delete'
    | 'find'
    | 'findBy'
    // | 'findOne'
    | 'merge'
    // | 'metadata'
  > {
  metadata: { name: string; targetName: string };

  findOne(options: FindOneOptions<Entity>): Promise<Entity | null>;

  create(entityLike: DeepPartial<Entity>): Entity;

  save<T extends DeepPartial<Entity>>(
    entities: T[],
    options?: SaveOptions,
  ): Promise<(T & Entity)[]>;
  save<T extends DeepPartial<Entity>>(
    entity: T,
    options?: SaveOptions,
  ): Promise<T & Entity>;
}
