import { Inject, NotFoundException, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
} from '@concepta/nestjs-access-control';
import {
  CrudBody,
  CrudController,
  CrudControllerInterface,
  CrudCreateOne,
  CrudDeleteOne,
  CrudReadMany,
  CrudReadOne,
  CrudReplaceOne,
  CrudRequest,
  CrudRequestInterface,
  CrudUpdateOne,
} from '@concepta/nestjs-crud';
import {
  CacheCreatableInterface,
  CacheInterface,
  CacheUpdatableInterface,
} from '@concepta/nestjs-common';
import { ReferenceAssignment } from '@concepta/nestjs-common';
import {
  CACHE_MODULE_CRUD_SERVICES_TOKEN,
  CACHE_MODULE_SETTINGS_TOKEN,
} from '../cache.constants';
import { CacheResource } from '../cache.types';
import { CachePaginatedDto } from '../dto/cache-paginated.dto';
import { CacheUpdateDto } from '../dto/cache-update.dto';
import { CacheDto } from '../dto/cache.dto';
import { CacheAssignmentNotFoundException } from '../exceptions/cache-assignment-not-found.exception';
import { CacheEntityNotFoundException } from '../exceptions/cache-entity-not-found.exception';
import { CacheSettingsInterface } from '../interfaces/cache-settings.interface';
import { CacheCrudService } from '../services/cache-crud.service';
import getExpirationDate from '../utils/get-expiration-date.util';
import { CacheService } from '../services/cache.service';
import { CacheCreateDto } from '../dto/cache-create.dto';
/**
 * Cache assignment controller.
 */
@ApiTags('cache')
@CrudController({
  path: 'cache/:assignment',
  model: {
    type: CacheDto,
    paginatedType: CachePaginatedDto,
  },
  params: {
    id: { field: 'id', type: 'string', primary: true },
    assignment: {
      field: 'assignment',
      disabled: true,
    },
  },
  join: { cache: { eager: true }, assignee: { eager: true } },
})
export class CacheCrudController
  implements
    CrudControllerInterface<
      CacheInterface,
      CacheCreatableInterface,
      CacheUpdatableInterface,
      CacheCreatableInterface
    >
{
  /**
   * Constructor.
   *
   * @param settings - cache settings
   * @param allCrudServices - instances of all crud services
   * @param cacheService - instance of cache service
   */
  constructor(
    @Inject(CACHE_MODULE_SETTINGS_TOKEN)
    private settings: CacheSettingsInterface,
    @Inject(CACHE_MODULE_CRUD_SERVICES_TOKEN)
    private allCrudServices: Record<string, CacheCrudService>,
    private cacheService: CacheService,
  ) {}

  /**
   * Get many
   *
   * @param crudRequest - the CRUD request object
   * @param assignment - the assignment
   */
  @CrudReadMany()
  @AccessControlReadMany(CacheResource.Many)
  async getMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    return this.getCrudService(assignment).getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest - the CRUD request object
   * @param assignment - The cache assignment
   */
  @CrudReadOne()
  @AccessControlReadOne(CacheResource.One)
  async getOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    return this.getCrudService(assignment).getOne(crudRequest);
  }

  /**
   * Create one
   *
   * @param crudRequest - the CRUD request object
   * @param cacheCreateDto - cache create dto
   * @param assignment - The cache assignment
   */
  @CrudCreateOne()
  @AccessControlCreateOne(CacheResource.One)
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() cacheCreateDto: CacheCreateDto,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    const expirationDate = getExpirationDate(
      cacheCreateDto.expiresIn ?? this.settings.expiresIn,
    );

    // call crud service to create
    return this.getCrudService(assignment).createOne(crudRequest, {
      ...cacheCreateDto,
      expirationDate,
    });
  }

  /**
   * Create one
   *
   * @param crudRequest - the CRUD request object
   * @param cacheUpdateDto - cache update dto
   * @param assignment - The cache assignment
   */
  @CrudUpdateOne()
  @AccessControlCreateOne(CacheResource.One)
  async updateOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() cacheUpdateDto: CacheUpdateDto,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    const expirationDate = getExpirationDate(
      cacheUpdateDto.expiresIn ?? this.settings.expiresIn,
    );

    // call crud service to create
    return this.getCrudService(assignment).updateOne(crudRequest, {
      ...cacheUpdateDto,
      expirationDate,
    });
  }

  /**
   * Delete one
   *
   * @param crudRequest - the CRUD request object
   * @param assignment - The cache assignment
   */
  @CrudDeleteOne()
  @AccessControlDeleteOne(CacheResource.One)
  async deleteOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    return this.getCrudService(assignment).deleteOne(crudRequest);
  }

  /**
   * Get the crud service for the given assignment.
   *
   * @internal
   * @param assignment - The cache assignment
   */
  protected getCrudService(assignment: ReferenceAssignment): CacheCrudService {
    const entityKey = this.getEntityKey(assignment);
    // repo matching assignment was injected?
    if (this.allCrudServices[entityKey]) {
      // yes, return it
      return this.allCrudServices[entityKey];
    } else {
      // bad entity key
      throw new CacheEntityNotFoundException(entityKey);
    }
  }

  /**
   * Do a Upsert operation for cache
   *
   * @param crudRequest - the CRUD request object
   * @param cacheUpdateDto - cache update dto
   * @param assignment - The cache assignment
   */
  @ApiOkResponse({
    type: CacheDto,
  })
  @CrudReplaceOne()
  @AccessControlCreateOne(CacheResource.One)
  async replaceOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() cacheUpdateDto: CacheUpdateDto,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    let cache;
    try {
      cache = await this.getOne(crudRequest, assignment);
    } catch (error) {
      // error is NOT a not found exception?
      if (error instanceof NotFoundException !== true) {
        // rethrow it
        throw error;
      }
    }
    if (cache && cache?.id) {
      const expirationDate = getExpirationDate(
        cacheUpdateDto.expiresIn ?? this.settings.expiresIn,
      );

      // call crud service to create
      return this.getCrudService(assignment).replaceOne(crudRequest, {
        ...cacheUpdateDto,
        expirationDate,
      });
    } else {
      return this.createOne(crudRequest, cacheUpdateDto, assignment);
    }
  }

  /**
   * Get the entity key for the given assignment.
   *
   * @param assignment - The cache assignment
   */
  protected getEntityKey(assignment: ReferenceAssignment): string {
    // have entity key for given assignment?
    if (this.settings.assignments[assignment]) {
      // yes, set it
      return this.settings.assignments[assignment].entityKey;
    } else {
      // bad assignment
      throw new CacheAssignmentNotFoundException(assignment);
    }
  }
}
