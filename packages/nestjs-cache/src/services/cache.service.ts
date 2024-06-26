import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DeepPartial, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { CacheInterface, CacheUpdatableInterface } from '@concepta/ts-common';
import { ReferenceAssignment, ReferenceId, Type } from '@concepta/ts-core';
import {
  QueryOptionsInterface,
  ReferenceLookupException,
  ReferenceMutateException,
  ReferenceValidationException,
  RepositoryProxy,
} from '@concepta/typeorm-common';
import {
  CACHE_MODULE_REPOSITORIES_TOKEN,
  CACHE_MODULE_SETTINGS_TOKEN,
} from '../cache.constants';
import { CacheCreateDto } from '../dto/cache-create.dto';
import { CacheUpdateDto } from '../dto/cache-update.dto';
import { CacheEntityNotFoundException } from '../exceptions/cache-entity-not-found.exception';
import { CacheServiceInterface } from '../interfaces/cache-service.interface';
import { CacheSettingsInterface } from '../interfaces/cache-settings.interface';
import getExpirationDate from '../utils/get-expiration-date.util';
import { CacheAssignmentNotFoundException } from '../exceptions/cache-assignment-not-found.exception';

@Injectable()
export class CacheService implements CacheServiceInterface {
  constructor(
    @Inject(CACHE_MODULE_REPOSITORIES_TOKEN)
    private allCacheRepos: Record<string, Repository<CacheInterface>>,
    @Inject(CACHE_MODULE_SETTINGS_TOKEN)
    protected readonly settings: CacheSettingsInterface,
  ) {}

  /**
   * Create a cache with a for the given assignee.
   *
   * @param assignment The cache assignment
   * @param cache The data to create
   */
  async create(
    assignment: ReferenceAssignment,
    cache: CacheCreateDto,
    queryOptions?: QueryOptionsInterface,
  ): Promise<CacheInterface> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // validate the data
    const dto = await this.validateDto<CacheCreateDto>(CacheCreateDto, cache);

    // break out the vars
    const { key, type, data, assignee, expiresIn } = dto;

    // try to find the relationship
    try {
      // generate the expiration date
      const expirationDate = getExpirationDate(
        expiresIn ?? this.settings.expiresIn,
      );

      // new repo proxy
      const repoProxy = new RepositoryProxy<CacheInterface>(assignmentRepo);

      // try to save the item
      return repoProxy.repository(queryOptions).save({
        key,
        type,
        data,
        assignee,
        expirationDate,
      });
    } catch (e) {
      throw new ReferenceMutateException(assignmentRepo.metadata.targetName, e);
    }
  }

  async update(
    assignment: ReferenceAssignment,
    cache: CacheUpdatableInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<CacheInterface> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // validate the data
    const dto = await this.validateDto<CacheUpdateDto>(CacheUpdateDto, cache);

    // generate the expiration date
    const expirationDate = getExpirationDate(
      dto.expiresIn ?? this.settings.expiresIn,
    );
    // new repo proxy
    const repoProxy = new RepositoryProxy<CacheInterface>(assignmentRepo);

    // try to update the item
    try {
      const assignedCache = await this.findCache(repoProxy, dto, queryOptions);
      if (!assignedCache)
        throw new CacheEntityNotFoundException(
          assignmentRepo.metadata.targetName,
        );

      const mergedEntity = await this.mergeEntity(
        repoProxy,
        assignedCache,
        dto,
        queryOptions,
      );

      return repoProxy.repository(queryOptions).save({
        ...mergedEntity,
        expirationDate,
      });
    } catch (e) {
      throw new ReferenceMutateException(assignmentRepo.metadata.targetName, e);
    }
  }

  /**
   * Delete a cache based on params
   *
   * @param assignment The cache assignment
   * @param cache The cache to delete
   */
  async delete(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assignee'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    // get cache from an assigned user for a category
    const assignedCache = await this.get(assignment, cache, queryOptions);

    if (assignedCache) {
      this.deleteCache(assignment, assignedCache.id, queryOptions);
    }
  }

  /**
   * Get all CACHEs for assignee.
   *
   * @param assignment The assignment of the check
   * @param cache The cache to get assignments
   */
  async getAssignedCaches(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'assignee'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<CacheInterface[]> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // break out the args
    const { assignee } = cache;

    // new repo proxy
    const repoProxy = new RepositoryProxy<CacheInterface>(assignmentRepo);

    // try to find the relationships
    try {
      // make the query
      const assignments = await repoProxy.repository(queryOptions).find({
        where: {
          assignee: { id: assignee.id },
        },
        relations: ['assignee'],
      });

      // return the caches from assignee
      return assignments;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, e);
    }
  }

  async get(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assignee'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<CacheInterface | null> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // new repo proxy
    const repoProxy = new RepositoryProxy<CacheInterface>(assignmentRepo);

    return await this.findCache(repoProxy, cache, queryOptions);
  }

  /**
   * Clear all caches for a given assignee.
   *
   * @param assignment The assignment of the repository
   * @param cache The cache to clear
   */
  async clear(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'assignee'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    // get all caches from an assigned user for a category
    const assignedCaches = await this.getAssignedCaches(
      assignment,
      cache,
      queryOptions,
    );

    // Map to get ids
    const assignedCacheIds = assignedCaches.map(
      (assignedCache) => assignedCache.id,
    );

    if (assignedCacheIds.length > 0)
      await this.deleteCache(assignment, assignedCacheIds, queryOptions);
  }

  /**
   * Delete CACHE based on assignment
   *
   * @private
   * @param assignment The assignment to delete id from
   * @param id The id or ids to delete
   */
  protected async deleteCache(
    assignment: ReferenceAssignment,
    id: ReferenceId | ReferenceId[],
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // new repo proxy
    const repoProxy = new RepositoryProxy<CacheInterface>(assignmentRepo);

    try {
      await repoProxy.repository(queryOptions).delete(id);
    } catch (e) {
      throw new ReferenceMutateException(assignmentRepo.metadata.targetName, e);
    }
  }

  // Should this be on nestjs-common?
  protected async validateDto<T extends DeepPartial<CacheInterface>>(
    type: Type<T>,
    data: T,
  ): Promise<T> {
    // convert to dto
    const dto = plainToInstance(type, data);

    // validate the data
    const validationErrors = await validate(dto);

    // any errors?
    if (validationErrors.length) {
      // yes, throw error
      throw new ReferenceValidationException(
        this.constructor.name,
        validationErrors,
      );
    }

    return dto;
  }

  protected async findCache(
    repoProxy: RepositoryProxy<CacheInterface>,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assignee'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<CacheInterface | null> {
    const { key, type, assignee } = cache;
    try {
      const repo = repoProxy.repository(queryOptions);
      const cache = await repo.findOne({
        where: {
          key,
          type,
          assignee,
        },
        relations: ['assignee'],
      });
      return cache;
    } catch (e) {
      throw new ReferenceLookupException(
        repoProxy.repository(queryOptions).metadata.targetName,
        e,
      );
    }
  }

  /**
   * Get the assignment repo for the given assignment.
   *
   * @private
   * @param assignment The cache assignment
   */
  protected getAssignmentRepo(
    assignment: ReferenceAssignment,
  ): Repository<CacheInterface> {
    if (this.settings.assignments[assignment]) {
      // get entity key based on assignment
      const entityKey = this.settings.assignments[assignment].entityKey;

      // repo matching assignment was injected?
      if (this.allCacheRepos[entityKey]) {
        // yes, return it
        return this.allCacheRepos[entityKey];
      } else {
        // bad assignment
        throw new CacheEntityNotFoundException(entityKey);
      }
    } else {
      // bad assignment
      throw new CacheAssignmentNotFoundException(assignment);
    }
  }

  private async mergeEntity(
    repoProxy: RepositoryProxy<CacheInterface>,
    assignedCache: CacheInterface,
    dto: CacheUpdateDto,
    queryOptions?: QueryOptionsInterface,
  ): Promise<CacheInterface> {
    return repoProxy.repository(queryOptions).merge(assignedCache, dto);
  }
}
