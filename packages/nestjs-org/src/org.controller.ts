import {
  CrudBody,
  CrudCreateOne,
  CrudDeleteOne,
  CrudReadAll,
  CrudReadOne,
  CrudRequest,
  CrudRequestInterface,
  CrudUpdateOne,
  CrudControllerInterface,
  CrudController,
  CrudCreateMany,
} from '@concepta/nestjs-crud';
import { ApiTags } from '@nestjs/swagger';
import { OrgCrudService } from './services/org-crud.service';
import { OrgDto } from './dto/org.dto';
import { OrgCreateDto } from './dto/org-create.dto';
import { OrgCreateManyDto } from './dto/org-create-many.dto';
import { OrgUpdateDto } from './dto/org-update.dto';
import { OrgPaginatedDto } from './dto/org-paginated.dto';
import { OrgEntityInterface } from './interfaces/org-entity.interface';
import { OrgCreatableInterface } from './interfaces/org-creatable.interface';
import { OrgUpdatableInterface } from './interfaces/org-updatable.interface';

/**
 * Org controller.
 */
@CrudController({
  path: 'org',
  model: {
    type: OrgDto,
    paginatedType: OrgPaginatedDto,
  },
})
@ApiTags('org')
export class OrgController
  implements
    CrudControllerInterface<
      OrgEntityInterface,
      OrgCreatableInterface,
      OrgUpdatableInterface
    >
{
  /**
   * Constructor.
   *
   * @param orgCrudService instance of the Org crud service
   */
  constructor(private orgCrudService: OrgCrudService) {}

  /**
   * Get many
   *
   * @param crudRequest the CRUD request object
   */
  @CrudReadAll()
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.orgCrudService.getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest the CRUD request object
   */
  @CrudReadOne()
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.orgCrudService.getOne(crudRequest);
  }

  /**
   * Create many
   *
   * @param crudRequest the CRUD request object
   * @param orgCreateManyDto org create many dto
   */
  @CrudCreateMany()
  async createMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() orgCreateManyDto: OrgCreateManyDto,
  ) {
    // call crud service to create
    return this.orgCrudService.createMany(crudRequest, orgCreateManyDto);
  }

  /**
   * Create one
   *
   * @param crudRequest the CRUD request object
   * @param orgCreateDto org create dto
   */
  @CrudCreateOne()
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() orgCreateDto: OrgCreateDto,
  ) {
    // call crud service to create
    return this.orgCrudService.createOne(crudRequest, orgCreateDto);
  }

  /**
   * Update one
   *
   * @param crudRequest the CRUD request object
   * @param orgUpdateDto org update dto
   */
  @CrudUpdateOne()
  async updateOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() orgUpdateDto: OrgUpdateDto,
  ) {
    return this.orgCrudService.updateOne(crudRequest, orgUpdateDto);
  }

  /**
   * Delete one
   *
   * @param crudRequest the CRUD request object
   */
  @CrudDeleteOne()
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.orgCrudService.deleteOne(crudRequest);
  }
}
