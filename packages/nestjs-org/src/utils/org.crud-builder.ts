import { PlainLiteralObject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConfigurableCrudBuilder,
  ConfigurableCrudOptions,
} from '@concepta/nestjs-crud';
import {
  AccessControlCreateMany,
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
  AccessControlRecoverOne,
  AccessControlReplaceOne,
  AccessControlUpdateOne,
} from '@concepta/nestjs-access-control';
import {
  DeepPartial,
  OrgCreatableInterface,
  OrgUpdatableInterface,
} from '@concepta/nestjs-common';
import { OrgDto } from '../dto/org.dto';
import { OrgCreateDto } from '../dto/org-create.dto';
import { OrgCreateManyDto } from '../dto/org-create-many.dto';
import { OrgUpdateDto } from '../dto/org-update.dto';
import { OrgPaginatedDto } from '../dto/org-paginated.dto';
import { OrgEntityInterface } from '@concepta/nestjs-common';
import { OrgResource } from '../org.types';
import { ORG_MODULE_CONFIGURABLE_CRUD_SERVICE_TOKEN } from '../org.constants';

const orgCrudBuilderDefaultOptions: ConfigurableCrudOptions = {
  service: {
    entityKey: 'org',
    injectionToken: ORG_MODULE_CONFIGURABLE_CRUD_SERVICE_TOKEN,
  },
  controller: {
    path: 'org',
    model: {
      type: OrgDto,
      paginatedType: OrgPaginatedDto,
    },
    extraDecorators: [ApiTags('org')],
  },
  getMany: {
    extraDecorators: [AccessControlReadMany(OrgResource.Many)],
  },
  getOne: {
    extraDecorators: [AccessControlReadOne(OrgResource.One)],
  },
  createMany: {
    dto: OrgCreateManyDto,
    extraDecorators: [AccessControlCreateMany(OrgResource.Many)],
  },
  createOne: {
    dto: OrgCreateDto,
    extraDecorators: [AccessControlCreateOne(OrgResource.One)],
  },
  updateOne: {
    dto: OrgUpdateDto,
    extraDecorators: [AccessControlUpdateOne(OrgResource.One)],
  },
  replaceOne: {
    dto: OrgUpdateDto,
    extraDecorators: [AccessControlReplaceOne(OrgResource.One)],
  },
  deleteOne: {
    extraDecorators: [AccessControlDeleteOne(OrgResource.One)],
  },
  recoverOne: {
    path: 'recover/:id',
    extraDecorators: [AccessControlRecoverOne(OrgResource.One)],
  },
};

export class OrgCrudBuilder<
  Entity extends OrgEntityInterface = OrgEntityInterface,
  Creatable extends DeepPartial<Entity> &
    OrgCreatableInterface = DeepPartial<Entity> & OrgCreatableInterface,
  Updatable extends DeepPartial<Entity> &
    OrgUpdatableInterface = DeepPartial<Entity> & OrgUpdatableInterface,
  Replaceable extends Creatable = Creatable,
  ExtraOptions extends PlainLiteralObject = PlainLiteralObject,
> extends ConfigurableCrudBuilder<
  Entity,
  Creatable,
  Updatable,
  Replaceable,
  ExtraOptions
> {
  constructor(options?: ConfigurableCrudOptions) {
    super(options ?? orgCrudBuilderDefaultOptions);
  }
}
