import { Inject } from '@nestjs/common';
import { PhotoEntityInterfaceFixture } from '../photo/interfaces/photo-entity.interface.fixture';
import { PhotoCreatableInterfaceFixture } from '../photo/interfaces/photo-creatable.interface.fixture';
import { PhotoUpdatableInterfaceFixture } from '../photo/interfaces/photo-updatable.interface.fixture';
import { PhotoFixture } from '../photo/photo.entity.fixture';
import { PhotoDtoFixture } from '../photo/dto/photo.dto.fixture';
import { PhotoPaginatedDtoFixture } from '../photo/dto/photo-paginated.dto.fixture';
import { PhotoCreateDtoFixture } from '../photo/dto/photo-create.dto.fixture';
import { PhotoCreateManyDtoFixture } from '../photo/dto/photo-create-many.dto.fixture';
import { PhotoUpdateDtoFixture } from '../photo/dto/photo-update.dto.fixture';
import { ConfigurableCrudBuilder } from '../../util/configurable-crud.builder';
import { CrudSoftDelete } from '../../decorators/routes/crud-soft-delete.decorator';
import { CrudBaseController } from '../../controllers/crud-base.controller';
import { CrudRequest } from '../../decorators/params/crud-request.decorator';
import { CrudRequestInterface } from '../../interfaces/crud-request.interface';
import { TypeOrmCrudService } from '../../services/typeorm-crud.service';
import { CrudBody } from '../../decorators/params/crud-body.decorator';

export const PHOTO_CRUD_SERVICE_TOKEN = Symbol('__PHOTO_CRUD_SERVICE_TOKEN__');

const crudBuilder = new ConfigurableCrudBuilder<
  PhotoEntityInterfaceFixture,
  PhotoCreatableInterfaceFixture,
  PhotoUpdatableInterfaceFixture
>({
  service: {
    entity: PhotoFixture,
    injectionToken: PHOTO_CRUD_SERVICE_TOKEN,
  },
  controller: {
    path: 'photo',
    model: {
      type: PhotoDtoFixture,
      paginatedType: PhotoPaginatedDtoFixture,
    },
  },
  getMany: {},
  getOne: {},
  createMany: {
    dto: PhotoCreateManyDtoFixture,
  },
  createOne: {
    dto: PhotoCreateDtoFixture,
  },
  updateOne: {
    dto: PhotoUpdateDtoFixture,
  },
  replaceOne: {
    dto: PhotoUpdateDtoFixture,
  },
  deleteOne: {
    extraDecorators: [CrudSoftDelete(true)],
  },
  recoverOne: { path: 'recover/:id' },
});

const {
  ConfigurableServiceClass,
  CrudController,
  CrudGetMany,
  CrudGetOne,
  CrudCreateMany,
  CrudCreateOne,
  CrudUpdateOne,
  CrudReplaceOne,
  CrudDeleteOne,
  CrudRecoverOne,
} = crudBuilder.build();

export class PhotoCcbCustomCrudServiceFixture extends ConfigurableServiceClass {}

@CrudController
export class PhotoCcbCustomControllerFixture extends CrudBaseController<
  PhotoEntityInterfaceFixture,
  PhotoCreatableInterfaceFixture,
  PhotoUpdatableInterfaceFixture
> {
  constructor(
    @Inject(PHOTO_CRUD_SERVICE_TOKEN)
    protected crudService: TypeOrmCrudService<PhotoEntityInterfaceFixture>,
  ) {
    super(crudService);
  }

  @CrudGetMany
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.crudService.getMany(crudRequest);
  }

  @CrudGetOne
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.crudService.getOne(crudRequest);
  }

  @CrudCreateMany
  async createMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() dto: PhotoCreateManyDtoFixture,
  ) {
    return this.crudService.createMany(crudRequest, dto);
  }

  @CrudCreateOne
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() dto: PhotoCreateDtoFixture,
  ) {
    return this.crudService.createOne(crudRequest, dto);
  }

  @CrudUpdateOne
  async updateOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() dto: PhotoUpdateDtoFixture,
  ) {
    return this.crudService.updateOne(crudRequest, dto);
  }

  @CrudReplaceOne
  async replaceOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() dto: PhotoUpdateDtoFixture,
  ) {
    return this.crudService.replaceOne(crudRequest, dto);
  }

  @CrudDeleteOne
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.crudService.deleteOne(crudRequest);
  }

  @CrudRecoverOne
  async recoverOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.crudService.recoverOne(crudRequest);
  }
}
