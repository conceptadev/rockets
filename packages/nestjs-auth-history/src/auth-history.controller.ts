import {
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
} from '@concepta/nestjs-access-control';
import { AuthHistoryCreatableInterface } from '@concepta/nestjs-common';
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
} from '@concepta/nestjs-crud';
import { ApiTags } from '@nestjs/swagger';

import { AuthHistoryResource } from './auth-history.types';
import { AuthHistoryCreateDto } from './dto/auth-history-create.dto';
import { AuthHistoryPaginatedDto } from './dto/auth-history-paginated.dto';
import { AuthHistoryDto } from './dto/auth-history.dto';
import { AuthHistoryEntityInterface } from './interfaces/auth-history-entity.interface';

import { AuthHistoryCrudService } from './services/auth-history-crud.service';

/**
 * AuthHistory controller.
 */
@CrudController({
  path: 'auth-history',
  model: {
    type: AuthHistoryDto,
    paginatedType: AuthHistoryPaginatedDto,
  },
})
@ApiTags('auth-history')
export class AuthHistoryController
  implements
    CrudControllerInterface<
      AuthHistoryEntityInterface,
      AuthHistoryCreatableInterface,
      never
    >
{
  /**
   * Constructor.
   *
   * @param authHistoryCrudService -  Instance of the auth history CRUD service
   * that handles basic CRUD operations
   */
  constructor(private authHistoryCrudService: AuthHistoryCrudService) {}

  /**
   * Get many
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudReadMany()
  @AccessControlReadMany(AuthHistoryResource.Many)
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.authHistoryCrudService.getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudReadOne()
  @AccessControlReadOne(AuthHistoryResource.One)
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.authHistoryCrudService.getOne(crudRequest);
  }

  /**
   * Create one
   *
   * @param crudRequest - the CRUD request object
   * @param authHistoryCreateDto - auth history create dto
   */
  @CrudCreateOne()
  @AccessControlCreateOne(AuthHistoryResource.One)
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() authHistoryCreateDto: AuthHistoryCreateDto,
  ) {
    // call crud service to create
    return this.authHistoryCrudService.createOne(
      crudRequest,
      authHistoryCreateDto,
    );
  }

  /**
   * Delete one
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudDeleteOne()
  @AccessControlDeleteOne(AuthHistoryResource.One)
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.authHistoryCrudService.deleteOne(crudRequest);
  }
}
