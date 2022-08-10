import { Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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

import { INVITATION_USER_LOOKUP_SERVICE_TOKEN } from '../invitation.constants';
import { InvitationService } from '../services/invitation.service';
import { InvitationCreateDto } from '../dto/invitation-create.dto';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationPaginatedDto } from '../dto/invitation-paginated.dto';
import { InvitationInterface } from '../../../ts-common/src/invitation/interfaces/invitation.interface';
import { InvitationCreatableInterface } from '../interfaces/invitation-creatable.interface';
import {
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
} from '@concepta/nestjs-access-control';
import { InvitationUserLookupServiceInterface } from '../interfaces/invitation-user-lookup.service.interface';
import { InvitationResource } from '../ivitation.types';
import { InvitationCrudService } from '../services/invitation-crud.service';
import { randomUUID } from 'crypto';

@CrudController({
  path: 'invitation',
  model: {
    type: InvitationDto,
    paginatedType: InvitationPaginatedDto,
  },
})
@ApiTags('invitation')
export class InvitationController
  implements
    CrudControllerInterface<
      InvitationInterface,
      InvitationCreatableInterface,
      InvitationCreatableInterface
    >
{
  constructor(
    private readonly invitationService: InvitationService,
    private readonly invitationCrudService: InvitationCrudService,
    @Inject(INVITATION_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: InvitationUserLookupServiceInterface,
  ) {}

  @CrudReadMany()
  @AccessControlReadMany(InvitationResource.Many)
  @ApiOperation({
    summary: 'Get many invitation using given criteria.',
  })
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.invitationCrudService.getMany(crudRequest);
  }

  @CrudReadOne()
  @AccessControlReadOne(InvitationResource.One)
  @ApiOperation({
    summary: 'Get one invitation by id.',
  })
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.invitationCrudService.getOne(crudRequest);
  }

  @CrudCreateOne()
  @AccessControlCreateOne(InvitationResource.One)
  @ApiOperation({
    summary: 'Create one invitation.',
  })
  async createOneCustom(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() invitationCreateDto: InvitationCreateDto,
  ) {
    const { email, category } = invitationCreateDto;
    const user = await this.invitationCrudService.getOrCreateOneUser(email);

    const invite = await this.invitationCrudService.createOne(crudRequest, {
      email,
      category,
      code: randomUUID(),
    });

    await this.invitationService.sendInvite(
      user.id,
      email,
      invite.code,
      category,
    );

    return invite;
  }

  @CrudDeleteOne()
  @AccessControlDeleteOne(InvitationResource.One)
  @ApiOperation({
    summary: 'Delete one invitation.',
  })
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.invitationCrudService.deleteOne(crudRequest);
  }
}
