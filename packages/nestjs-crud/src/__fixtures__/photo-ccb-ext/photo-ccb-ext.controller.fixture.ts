import { PhotoEntityInterfaceFixture } from '../photo/interfaces/photo-entity.interface.fixture';
import { PhotoCreatableInterfaceFixture } from '../photo/interfaces/photo-creatable.interface.fixture';
import { PhotoUpdatableInterfaceFixture } from '../photo/interfaces/photo-updatable.interface.fixture';
import { PhotoDtoFixture } from '../photo/dto/photo.dto.fixture';
import { PhotoPaginatedDtoFixture } from '../photo/dto/photo-paginated.dto.fixture';
import { PhotoCreateDtoFixture } from '../photo/dto/photo-create.dto.fixture';
import { PhotoCreateManyDtoFixture } from '../photo/dto/photo-create-many.dto.fixture';
import { PhotoUpdateDtoFixture } from '../photo/dto/photo-update.dto.fixture';
import { ConfigurableCrudBuilder } from '../../util/configurable-crud.builder';
import { CrudSoftDelete } from '../../decorators/routes/crud-soft-delete.decorator';

export const PHOTO_CRUD_SERVICE_TOKEN = Symbol('__PHOTO_CRUD_SERVICE_TOKEN__');

const crudBuilder = new ConfigurableCrudBuilder<
  PhotoEntityInterfaceFixture,
  PhotoCreatableInterfaceFixture,
  PhotoUpdatableInterfaceFixture
>();

const { ConfigurableControllerClass, ConfigurableServiceClass } =
  crudBuilder.build({
    service: {
      entityKey: 'photo',
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

export class PhotoCcbExtCrudServiceFixture extends ConfigurableServiceClass {}
export class PhotoCcbExtControllerFixture extends ConfigurableControllerClass {}
