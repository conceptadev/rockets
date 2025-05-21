import {
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
} from '@concepta/nestjs-access-control';
import {
  CacheCreatableInterface,
  CacheInterface,
  CacheUpdatableInterface,
} from '@concepta/nestjs-common';
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
import { NotFoundException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CacheResource } from '../cache.types';
import { CacheCreateDto } from '../dto/cache-create.dto';
import { CachePaginatedDto } from '../dto/cache-paginated.dto';
import { CacheUpdateDto } from '../dto/cache-update.dto';
import { CacheDto } from '../dto/cache.dto';
import getExpirationDate from '../utils/get-expiration-date.util';
import { CacheCrudServiceFixture } from './cache-crud.service.fixture';
/**
 * Cache assignment controller.
 */
@ApiTags('cache')
@CrudController({
  path: 'cache/user',
  model: {
    type: CacheDto,
    paginatedType: CachePaginatedDto,
  },
  params: {
    id: { field: 'id', type: 'string', primary: true },
  },
})
export class CacheCrudControllerFixture
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
   * @param cacheCrudService - instances of all crud services
   */
  constructor(private cacheCrudService: CacheCrudServiceFixture) {}

  /**
   * Get many
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudReadMany()
  @AccessControlReadMany(CacheResource.Many)
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.cacheCrudService.getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudReadOne()
  @AccessControlReadOne(CacheResource.One)
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.cacheCrudService.getOne(crudRequest);
  }

  /**
   * Create one
   *
   * @param crudRequest - the CRUD request object
   * @param cacheCreateDto - cache create dto
   */
  @CrudCreateOne()
  @AccessControlCreateOne(CacheResource.One)
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() cacheCreateDto: CacheCreateDto,
  ) {
    const expirationDate = getExpirationDate(cacheCreateDto.expiresIn);

    // call crud service to create
    return this.cacheCrudService.createOne(crudRequest, {
      ...cacheCreateDto,
      expirationDate,
    });
  }

  /**
   * Create one
   *
   * @param crudRequest - the CRUD request object
   * @param cacheUpdateDto - cache update dto
   */
  @CrudUpdateOne()
  @AccessControlCreateOne(CacheResource.One)
  async updateOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() cacheUpdateDto: CacheUpdateDto,
  ) {
    const expirationDate = getExpirationDate(cacheUpdateDto.expiresIn);

    // call crud service to create
    return this.cacheCrudService.updateOne(crudRequest, {
      ...cacheUpdateDto,
      expirationDate,
    });
  }

  /**
   * Delete one
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudDeleteOne()
  @AccessControlDeleteOne(CacheResource.One)
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.cacheCrudService.deleteOne(crudRequest);
  }

  /**
   * Do a Upsert operation for cache
   *
   * @param crudRequest - the CRUD request object
   * @param cacheUpdateDto - cache update dto
   */
  @ApiOkResponse({
    type: CacheDto,
  })
  @CrudReplaceOne()
  @AccessControlCreateOne(CacheResource.One)
  async replaceOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() cacheUpdateDto: CacheUpdateDto,
  ) {
    let cache;
    try {
      cache = await this.getOne(crudRequest);
    } catch (error) {
      // error is NOT a not found exception?
      if (error instanceof NotFoundException !== true) {
        // rethrow it
        throw error;
      }
    }
    if (cache && cache?.id) {
      const expirationDate = getExpirationDate(cacheUpdateDto.expiresIn);

      // call crud service to create
      return this.cacheCrudService.replaceOne(crudRequest, {
        ...cacheUpdateDto,
        expirationDate,
      });
    } else {
      return this.createOne(crudRequest, cacheUpdateDto);
    }
  }
}
