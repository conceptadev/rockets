import { Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  CrudRequest,
  CrudRequestInterface,
  CrudUpdateOne,
} from '@concepta/nestjs-crud';
import {
  CacheCreatableInterface,
  CacheInterface,
  CacheUpdatableInterface,
} from '@concepta/ts-common';
import { ReferenceAssignment } from '@concepta/ts-core';
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
      never
    >
{
  /**
   * Constructor.
   *
   * @param allCrudServices instances of all crud services
   */
  constructor(
    @Inject(CACHE_MODULE_SETTINGS_TOKEN)
    private settings: CacheSettingsInterface,
    @Inject(CACHE_MODULE_CRUD_SERVICES_TOKEN)
    private allCrudServices: Record<string, CacheCrudService>,
  ) {}

  /**
   * Get many
   *
   * @param crudRequest the CRUD request object
   * @param assignment the assignment
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
   * @param crudRequest the CRUD request object
   * @param assignment The cache assignment
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
   * @param crudRequest the CRUD request object
   * @param cacheCreateDto cache create dto
   * @param assignment The cache assignment
   */
  @CrudCreateOne()
  @AccessControlCreateOne(CacheResource.One)
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() cacheCreateDto: CacheCreatableInterface,
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
   * @param crudRequest the CRUD request object
   * @param cacheUpdateDto cache create dto
   * @param assignment The cache assignment
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
   * @param crudRequest the CRUD request object
   * @param assignment The cache assignment
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
   * @private
   * @param assignment The cache assignment
   */
  protected getCrudService(assignment: ReferenceAssignment): CacheCrudService {
    // have entity key for given assignment?
    if (this.settings.assignments[assignment]) {
      // yes, set it
      const entityKey = this.settings.assignments[assignment].entityKey;
      // repo matching assignment was injected?
      if (this.allCrudServices[entityKey]) {
        // yes, return it
        return this.allCrudServices[entityKey];
      } else {
        // bad entity key
        throw new CacheEntityNotFoundException(entityKey);
      }
    } else {
      // bad assignment
      throw new CacheAssignmentNotFoundException(assignment);
    }
  }
}
