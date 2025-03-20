import { ObjectLiteral, Repository } from 'typeorm';
import { EntityManagerInterface } from './entity-manager-repository.interface';

export interface RepositoryInterface<Entity extends ObjectLiteral>
  extends Pick<
    Repository<Entity>,
    | 'update'
    | 'create'
    | 'save'
    | 'count'
    | 'remove'
    | 'delete'
    | 'find'
    | 'findBy'
    | 'findOne'
    | 'merge'
    | 'metadata'
  > {
  readonly manager: EntityManagerInterface;
}
