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
import { CrudCreateManyInterface } from '../../interfaces/crud-create-many.interface';
import { CrudSoftDelete } from '../../decorators/routes/crud-soft-delete.decorator';
import { CrudRequestInterface } from '../../interfaces/crud-request.interface';

export const PHOTO_CRUD_SERVICE_TOKEN = Symbol('__PHOTO_CRUD_SERVICE_TOKEN__');

const crudBuilder = new ConfigurableCrudBuilder<
  PhotoEntityInterfaceFixture,
  PhotoCreatableInterfaceFixture,
  PhotoUpdatableInterfaceFixture
>();

const {
  ConfigurableServiceClass,
  ConfigurableControllerClass,
  CrudController,
  CrudGetMany,
  CrudGetOne,
  CrudCreateMany,
  CrudCreateOne,
  CrudUpdateOne,
  CrudReplaceOne,
  CrudDeleteOne,
  CrudRecoverOne,
} = crudBuilder.build({
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

export class PhotoCcbSubCrudServiceFixture extends ConfigurableServiceClass {}

@CrudController
export class PhotoCcbSubControllerFixture extends ConfigurableControllerClass {
  @CrudGetMany
  async getMany(crudRequest: CrudRequestInterface) {
    return super.getMany(crudRequest);
  }

  @CrudGetOne
  async getOne(crudRequest: CrudRequestInterface) {
    return super.getOne(crudRequest);
  }

  @CrudCreateMany
  async createMany(
    crudRequest: CrudRequestInterface,
    dto: CrudCreateManyInterface<PhotoCreatableInterfaceFixture>,
  ) {
    return super.createMany(crudRequest, dto);
  }

  @CrudCreateOne
  async createOne(
    crudRequest: CrudRequestInterface,
    dto: PhotoCreatableInterfaceFixture,
  ) {
    return super.createOne(crudRequest, dto);
  }

  @CrudUpdateOne
  async updateOne(
    crudRequest: CrudRequestInterface,
    dto: PhotoUpdatableInterfaceFixture,
  ) {
    return super.createOne(crudRequest, dto);
  }

  @CrudReplaceOne
  async replaceOne(
    crudRequest: CrudRequestInterface,
    dto: PhotoUpdatableInterfaceFixture,
  ) {
    return super.replaceOne(crudRequest, dto);
  }

  @CrudDeleteOne
  async deleteOne(crudRequest: CrudRequestInterface) {
    return super.deleteOne(crudRequest);
  }

  @CrudRecoverOne
  async recoverOne(crudRequest: CrudRequestInterface) {
    return super.recoverOne(crudRequest);
  }
}
