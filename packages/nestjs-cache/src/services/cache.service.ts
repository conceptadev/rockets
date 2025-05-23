import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import {
  CacheInterface,
  CacheUpdatableInterface,
  DeepPartial,
  ReferenceAssignment,
  Type,
  RepositoryInterface,
  ModelQueryException,
  ModelMutateException,
  ModelValidationException,
} from '@concepta/nestjs-common';
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
    private allCacheRepos: Record<string, RepositoryInterface<CacheInterface>>,
    @Inject(CACHE_MODULE_SETTINGS_TOKEN)
    protected readonly settings: CacheSettingsInterface,
  ) {}

  /**
   * Create a cache with a for the given assignee.
   *
   * @param assignment - The cache assignment
   * @param cache - The data to create
   */
  async create(
    assignment: ReferenceAssignment,
    cache: CacheCreateDto,
  ): Promise<CacheInterface> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // validate the data
    const dto = await this.validateDto<CacheCreateDto>(CacheCreateDto, cache);

    // break out the vars
    const { key, type, data, assigneeId, expiresIn } = dto;

    // try to find the relationship
    try {
      // generate the expiration date
      const expirationDate = getExpirationDate(
        expiresIn ?? this.settings.expiresIn,
      );

      // try to save the item
      return assignmentRepo.save({
        key,
        type,
        data,
        assigneeId,
        expirationDate,
      });
    } catch (e) {
      throw new ModelMutateException(assignmentRepo.entityName(), {
        originalError: e,
      });
    }
  }

  async update(
    assignment: ReferenceAssignment,
    cache: CacheUpdatableInterface,
  ): Promise<CacheInterface> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // validate the data
    const dto = await this.validateDto<CacheUpdateDto>(CacheUpdateDto, cache);

    // generate the expiration date
    const expirationDate = getExpirationDate(
      dto.expiresIn ?? this.settings.expiresIn,
    );

    // try to update the item
    try {
      const assignedCache = await this.findCache(assignmentRepo, dto);
      if (!assignedCache)
        throw new CacheEntityNotFoundException(assignmentRepo.entityName());

      const mergedEntity = await this.mergeEntity(
        assignmentRepo,
        assignedCache,
        dto,
      );

      return assignmentRepo.save({
        ...mergedEntity,
        expirationDate,
      });
    } catch (e) {
      throw new ModelMutateException(assignmentRepo.entityName(), {
        originalError: e,
      });
    }
  }

  /**
   * Delete a cache based on params
   *
   * @param assignment - The cache assignment
   * @param cache - The cache to delete
   */
  async delete(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assigneeId'>,
  ): Promise<void> {
    // get cache from an assigned user for a category
    const assignedCache = await this.get(assignment, cache);

    if (assignedCache) {
      return this.deleteCache(assignment, assignedCache);
    }
  }

  /**
   * Get all CACHEs for assignee.
   *
   * @param assignment - The assignment of the check
   * @param cache - The cache to get assignments
   */
  async getAssignedCaches(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'assigneeId'>,
  ): Promise<CacheInterface[]> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // break out the args
    const { assigneeId } = cache;

    // try to find the relationships
    try {
      // make the query
      const assignments = await assignmentRepo.find({
        where: {
          assigneeId,
        },
      });

      // return the caches from assignee
      return assignments;
    } catch (e) {
      throw new ModelQueryException(assignmentRepo.entityName(), {
        originalError: e,
      });
    }
  }

  async get(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assigneeId'>,
  ): Promise<CacheInterface | null> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    return await this.findCache(assignmentRepo, cache);
  }

  /**
   * Clear all caches for a given assignee.
   *
   * @param assignment - The assignment of the repository
   * @param cache - The cache to clear
   */
  async clear(
    assignment: ReferenceAssignment,
    cache: Pick<CacheInterface, 'assigneeId'>,
  ): Promise<void> {
    // get all caches from an assigned user for a category
    const assignedCaches = await this.getAssignedCaches(assignment, cache);

    if (assignedCaches.length > 0)
      await this.deleteCache(assignment, assignedCaches);
  }

  /**
   * Delete CACHE based on assignment
   *
   * @internal
   * @param assignment - The assignment to delete id from
   * @param entity - The id or ids to delete
   */
  protected async deleteCache(
    assignment: ReferenceAssignment,
    entity: CacheInterface | CacheInterface[],
  ): Promise<void> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    try {
      await assignmentRepo.remove(Array.isArray(entity) ? entity : [entity]);
    } catch (e) {
      throw new ModelMutateException(assignmentRepo.entityName(), {
        originalError: e,
      });
    }
  }

  async updateOrCreate(
    assignment: ReferenceAssignment,
    cache: CacheCreateDto,
  ): Promise<CacheInterface> {
    const existingCache = await this.get(assignment, cache);
    if (existingCache) {
      return await this.update(assignment, cache);
    } else {
      return await this.create(assignment, cache);
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
      throw new ModelValidationException(
        this.constructor.name,
        validationErrors,
      );
    }

    return dto;
  }

  protected async findCache(
    repo: RepositoryInterface<CacheInterface>,
    cache: Pick<CacheInterface, 'key' | 'type' | 'assigneeId'>,
  ): Promise<CacheInterface | null> {
    const { key, type, assigneeId } = cache;

    try {
      if (!key || !type || !assigneeId) {
        return null;
      }
      const cache = await repo.findOne({
        where: {
          key,
          type,
          assigneeId,
        },
      });
      return cache;
    } catch (e) {
      throw new ModelQueryException(repo.entityName(), {
        originalError: e,
      });
    }
  }

  /**
   * Get the assignment repo for the given assignment.
   *
   * @internal
   * @param assignment - The cache assignment
   */
  protected getAssignmentRepo(
    assignment: ReferenceAssignment,
  ): RepositoryInterface<CacheInterface> {
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
    repo: RepositoryInterface<CacheInterface>,
    assignedCache: CacheInterface,
    dto: CacheUpdateDto,
  ): Promise<CacheInterface> {
    return repo.merge(assignedCache, dto);
  }
}
