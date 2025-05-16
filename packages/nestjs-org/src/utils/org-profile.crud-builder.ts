import { PlainLiteralObject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConfigurableCrudBuilder,
  ConfigurableCrudOptions,
} from '@concepta/nestjs-crud';
import {
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
  OrgProfileCreatableInterface,
} from '@concepta/nestjs-common';
import { OrgProfileResource } from '../org.types';
import { OrgProfileEntityInterface } from '@concepta/nestjs-common';
import { OrgProfileDto } from '../dto/profile/org-profile.dto';
import { OrgProfilePaginatedDto } from '../dto/profile/org-profile-paginated.dto';
import { OrgProfileCreateDto } from '../dto/profile/org-profile-create.dto';
import { OrgProfileUpdateDto } from '../dto/profile/org-profile-update.dto';
import { ORG_MODULE_CONFIGURABLE_CRUD_PROFILE_SERVICE_TOKEN } from '../org.constants';

const orgProfileCrudBuilderDefaultOptions: ConfigurableCrudOptions = {
  service: {
    entityKey: 'org-profile',
    injectionToken: ORG_MODULE_CONFIGURABLE_CRUD_PROFILE_SERVICE_TOKEN,
  },
  controller: {
    path: 'org-profile',
    model: {
      type: OrgProfileDto,
      paginatedType: OrgProfilePaginatedDto,
    },
    extraDecorators: [ApiTags('org-profile')],
  },
  getMany: {
    extraDecorators: [AccessControlReadMany(OrgProfileResource.Many)],
  },
  getOne: {
    extraDecorators: [AccessControlReadOne(OrgProfileResource.One)],
  },
  createOne: {
    dto: OrgProfileCreateDto,
    extraDecorators: [AccessControlCreateOne(OrgProfileResource.One)],
  },
  updateOne: {
    dto: OrgProfileUpdateDto,
    extraDecorators: [AccessControlUpdateOne(OrgProfileResource.One)],
  },
  replaceOne: {
    dto: OrgProfileUpdateDto,
    extraDecorators: [AccessControlReplaceOne(OrgProfileResource.One)],
  },
  deleteOne: {
    extraDecorators: [AccessControlDeleteOne(OrgProfileResource.One)],
  },
  recoverOne: {
    path: 'recover/:id',
    extraDecorators: [AccessControlRecoverOne(OrgProfileResource.One)],
  },
};

export class OrgProfileCrudBuilder<
  Entity extends OrgProfileEntityInterface = OrgProfileEntityInterface,
  Creatable extends DeepPartial<Entity> &
    OrgProfileCreatableInterface = DeepPartial<Entity> &
    OrgProfileCreatableInterface,
  Updatable extends DeepPartial<Entity> = DeepPartial<Entity>,
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
    super(options ?? orgProfileCrudBuilderDefaultOptions);
  }
}
