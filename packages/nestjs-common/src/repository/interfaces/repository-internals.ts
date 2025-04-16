/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable tsdoc/syntax */
/**
 * !!! COPIED FROM TYPEORM !!!
 *
 * Some were not copied verbatim due to ridiculousness.
 *
 * These types need to be reduces to the smalles possible interface.
 */

import { PlainLiteralObject } from '@nestjs/common';
// import { ObjectId } from './bson.typings';

export namespace RepositoryInternals {
  /**
   * A single property handler for FindOptionsSelect.
   */
  export type FindOptionsSelectProperty<Property> = Property extends Promise<
    infer I
  >
    ? FindOptionsSelectProperty<I> | boolean
    : Property extends Array<infer I>
    ? FindOptionsSelectProperty<I> | boolean
    : Property extends string
    ? boolean
    : Property extends number
    ? boolean
    : Property extends boolean
    ? boolean
    : Property extends Function
    ? never
    : Property extends Buffer
    ? boolean
    : Property extends Date
    ? boolean
    : // : Property extends ObjectId
    // ? boolean
    Property extends object
    ? FindOptionsSelect<Property>
    : boolean;
  /**
   * Select find options.
   */
  export type FindOptionsSelect<Entity> = {
    [P in keyof Entity]?: P extends 'toString'
      ? unknown
      : FindOptionsSelectProperty<NonNullable<Entity[P]>>;
  };
  /**
   * Property paths (column names) to be selected by "find" defined as string.
   * Old selection mechanism in TypeORM.
   *
   * @deprecated will be removed in the next version, use FindOptionsSelect type notation instead
   */
  export type FindOptionsSelectByString<Entity> = (keyof Entity)[];

  /**
   * A single property handler for FindOptionsOrder.
   */
  export type FindOptionsOrderProperty<Property> = Property extends Promise<
    infer I
  >
    ? FindOptionsOrderProperty<NonNullable<I>>
    : Property extends Array<infer I>
    ? FindOptionsOrderProperty<NonNullable<I>>
    : Property extends Function
    ? never
    : Property extends string
    ? FindOptionsOrderValue
    : Property extends number
    ? FindOptionsOrderValue
    : Property extends boolean
    ? FindOptionsOrderValue
    : Property extends Buffer
    ? FindOptionsOrderValue
    : Property extends Date
    ? FindOptionsOrderValue
    : Property extends object
    ? FindOptionsOrder<Property> | FindOptionsOrderValue
    : FindOptionsOrderValue;
  /**
   * Order by find options.
   */
  export type FindOptionsOrder<Entity> = {
    [P in keyof Entity]?: P extends 'toString'
      ? unknown
      : FindOptionsOrderProperty<NonNullable<Entity[P]>>;
  };
  /**
   * Value of order by in find options.
   */
  export type FindOptionsOrderValue =
    | 'ASC'
    | 'DESC'
    | 'asc'
    | 'desc'
    | 1
    | -1
    | {
        direction?: 'asc' | 'desc' | 'ASC' | 'DESC';
        nulls?: 'first' | 'last' | 'FIRST' | 'LAST';
      };

  /**
   * Defines a special criteria to find specific entity.
   */
  export interface FindOneOptions<Entity = any> {
    /**
     * Adds a comment with the supplied string in the generated query.  This is
     * helpful for debugging purposes, such as finding a specific query in the
     * database server's logs, or for categorization using an APM product.
     */
    comment?: string;
    /**
     * Specifies what columns should be retrieved.
     */
    select?: FindOptionsSelect<Entity> | FindOptionsSelectByString<Entity>;
    /**
     * Simple condition that should be applied to match entities.
     */
    where?: FindOptionsWhere<Entity>[] | FindOptionsWhere<Entity>;
    /**
     * Indicates what relations of entity should be loaded (simplified left join form).
     */
    relations?: FindOptionsRelations<Entity> | FindOptionsRelationByString;
    /**
     * Specifies how relations must be loaded - using "joins" or separate queries.
     * If you are loading too much data with nested joins it's better to load relations
     * using separate queries.
     *
     * Default strategy is "join", but default can be customized in connection options.
     */
    relationLoadStrategy?: 'join' | 'query';
    /**
     * Specifies what relations should be loaded.
     *
     * @deprecated
     */
    // join?: JoinOptions;
    /**
     * Order, in which entities should be ordered.
     */
    order?: FindOptionsOrder<Entity>;
    /**
     * Enables or disables query result caching.
     */
    cache?:
      | boolean
      | number
      | {
          id: any;
          milliseconds: number;
        };
    /**
     * Indicates what locking mode should be used.
     *
     * Note: For lock tables, you must specify the table names and not the relation names
     */
    lock?:
      | {
          mode: 'optimistic';
          version: number | Date;
        }
      | {
          mode:
            | 'pessimistic_read'
            | 'pessimistic_write'
            | 'dirty_read'
            | 'pessimistic_partial_write'
            | 'pessimistic_write_or_fail'
            | 'for_no_key_update'
            | 'for_key_share';
          tables?: string[];
          onLocked?: 'nowait' | 'skip_locked';
        };
    /**
     * Indicates if soft-deleted rows should be included in entity result.
     */
    withDeleted?: boolean;
    /**
     * If sets to true then loads all relation ids of the entity and maps them into relation values (not relation objects).
     * If array of strings is given then loads only relation ids of the given properties.
     */
    loadRelationIds?:
      | boolean
      | {
          relations?: string[];
          disableMixedMap?: boolean;
        };
    /**
     * Indicates if eager relations should be loaded or not.
     * By default, they are loaded when find methods are used.
     */
    loadEagerRelations?: boolean;
    /**
     * If this is set to true, SELECT query in a `find` method will be executed in a transaction.
     */
    transaction?: boolean;
  }

  /**
   * A single property handler for FindOptionsRelations.
   */
  export type FindOptionsRelationsProperty<Property> = Property extends Promise<
    infer I
  >
    ? FindOptionsRelationsProperty<NonNullable<I>> | boolean
    : Property extends Array<infer I>
    ? FindOptionsRelationsProperty<NonNullable<I>> | boolean
    : Property extends string
    ? never
    : Property extends number
    ? never
    : Property extends boolean
    ? never
    : Property extends Function
    ? never
    : Property extends Buffer
    ? never
    : Property extends Date
    ? never
    : // : Property extends ObjectId
    // ? never
    Property extends object
    ? FindOptionsRelations<Property> | boolean
    : boolean;
  /**
   * Relations find options.
   */
  export type FindOptionsRelations<Entity> = {
    [P in keyof Entity]?: P extends 'toString'
      ? unknown
      : FindOptionsRelationsProperty<NonNullable<Entity[P]>>;
  };

  /**
   * Relation names to be selected by "relation" defined as string.
   * Old relation mechanism in TypeORM.
   *
   * @deprecated will be removed in the next version, use FindOptionsRelation type notation instead
   */
  export type FindOptionsRelationByString = string[];

  /**
   * A single property handler for FindOptionsWhere.
   *
   * The reason why we have both "PropertyToBeNarrowed" and "Property" is that Union is narrowed down when extends is used.
   * It means the result of FindOptionsWhereProperty<1 | 2> doesn't include FindOperator<1 | 2> but FindOperator<1> | FindOperator<2>.
   * So we keep the original Union as Original and pass it to the FindOperator too. Original remains Union as extends is not used for it.
   */
  export type FindOptionsWhereProperty<
    PropertyToBeNarrowed,
    Property = PropertyToBeNarrowed,
  > = PropertyToBeNarrowed extends Promise<infer I>
    ? FindOptionsWhereProperty<NonNullable<I>>
    : PropertyToBeNarrowed extends Array<infer I>
    ? FindOptionsWhereProperty<NonNullable<I>>
    : Property;
  // : PropertyToBeNarrowed extends Function
  // ? never
  // : PropertyToBeNarrowed extends Buffer
  // ? Property | FindOperator<Property>
  // : PropertyToBeNarrowed extends Date
  // ? Property | FindOperator<Property>
  // : PropertyToBeNarrowed extends ObjectId
  // ? Property | FindOperator<Property>
  // : PropertyToBeNarrowed extends string
  // ? Property | FindOperator<Property>
  // : PropertyToBeNarrowed extends number
  // ? Property | FindOperator<Property>
  // : PropertyToBeNarrowed extends boolean
  // ? Property | FindOperator<Property>
  // : PropertyToBeNarrowed extends object
  // ?
  // | FindOptionsWhere<Property>
  // | FindOptionsWhere<Property>[]
  // | EqualOperator<Property>
  // | FindOperator<any>
  // | boolean
  // | Property
  // : Property | FindOperator<Property>;
  /**
   * Used for find operations.
   */
  export type FindOptionsWhere<Entity> = {
    [P in keyof Entity]?: P extends 'toString'
      ? unknown
      : FindOptionsWhereProperty<NonNullable<Entity[P]>>;
  };

  /**
   * Make all properties in T optional
   */
  export type QueryPartialEntity<T> = {
    [P in keyof T]?: T[P] | (() => string);
  };

  /**
   * Make all properties in T optional. Deep version.
   */
  export type QueryDeepPartialEntity<T> = _QueryDeepPartialEntity<
    PlainLiteralObject extends T ? unknown : T
  >;
  type _QueryDeepPartialEntity<T> = {
    [P in keyof T]?:
      | (T[P] extends Array<infer U>
          ? Array<_QueryDeepPartialEntity<U>>
          : T[P] extends ReadonlyArray<infer U>
          ? ReadonlyArray<_QueryDeepPartialEntity<U>>
          : _QueryDeepPartialEntity<T[P]>)
      | (() => string);
  };

  // export declare class EqualOperator<T> extends FindOperator<T> {
  //   constructor(value: T | FindOperator<T>);
  // }

  /**
   * Interface for objects that deal with (un)marshalling data.
   */
  export interface ValueTransformer {
    /**
     * Used to marshal data when writing to the database.
     */
    to(value: any): any;
    /**
     * Used to unmarshal data when reading from the database.
     */
    from(value: any): any;
  }

  /**
   * List of types that FindOperator can be.
   */
  // export type FindOperatorType =
  //   | 'not'
  //   | 'lessThan'
  //   | 'lessThanOrEqual'
  //   | 'moreThan'
  //   | 'moreThanOrEqual'
  //   | 'equal'
  //   | 'between'
  //   | 'in'
  //   | 'any'
  //   | 'isNull'
  //   | 'ilike'
  //   | 'like'
  //   | 'raw'
  //   | 'arrayContains'
  //   | 'arrayContainedBy'
  //   | 'arrayOverlap'
  //   | 'and'
  //   | 'jsonContains'
  //   | 'or';

  /**
   * Result object returned by UpdateQueryBuilder execution.
   */
  export declare class UpdateResult {
    /**
     * Number of affected rows/documents
     * Not all drivers support this
     */
    affected?: number;
  }

  /**
   * Special options passed to Repository#save, Repository#insert and Repository#update methods.
   */
  export interface SaveOptions {
    /**
     * Additional data to be passed with persist method.
     * This data can be used in subscribers then.
     */
    data?: any;
    /**
     * Flag to determine whether the entity that is being persisted
     * should be reloaded during the persistence operation.
     *
     * It will work only on databases which does not support RETURNING / OUTPUT statement.
     * Enabled by default.
     */
    reload?: boolean;
  }

  /**
   * Special options passed to Repository#remove and Repository#delete methods.
   */
  export interface RemoveOptions {
    /**
     * Additional data to be passed with remove method.
     * This data can be used in subscribers then.
     */
    data?: any;
  }

  /**
   * Result object returned by DeleteQueryBuilder execution.
   */
  export declare class DeleteResult {
    /**
     * Number of affected rows/documents
     * Not all drivers support this
     */
    affected?: number | null;
  }

  /**
   * Defines a special criteria to find specific entities.
   */
  export interface FindManyOptions<Entity = any>
    extends FindOneOptions<Entity> {
    /**
     * Offset (paginated) where from entities should be taken.
     */
    skip?: number;
    /**
     * Limit (paginated) - max number of entities should be taken.
     */
    take?: number;
  }
}
