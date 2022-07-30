import { Body, Get, Inject, NotFoundException, Param } from '@nestjs/common';
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
import { InvitationAcceptInviteDto } from '../dto/invitation-accept-invite.dto';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationPaginatedDto } from '../dto/invitation-paginated.dto';
import { InvitationInterface } from '../interfaces/invitation.interface';
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
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.invitationCrudService.getMany(crudRequest);
  }

  @CrudReadOne()
  @AccessControlReadOne(InvitationResource.One)
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.invitationCrudService.getOne(crudRequest);
  }

  @CrudCreateOne()
  @AccessControlCreateOne(InvitationResource.One)
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

  @ApiOperation({
    summary: 'Check if passcode is valid.',
  })
  @Get('/:code?passcode=')
  async validatePasscode(
    @Param('code') code: string,
    @Body() invitationAcceptInviteDto: InvitationAcceptInviteDto,
  ): Promise<void> {
    const { passcode } = invitationAcceptInviteDto;
    const invitation = await this.invitationCrudService.getOneByCode(code);

    if (!invitation) {
      throw new NotFoundException();
    }

    const { category } = invitation;
    const otp = await this.invitationService.validatePasscode(
      passcode,
      category,
      false,
    );

    if (!otp) {
      throw new NotFoundException();
    }
  }

  @CrudDeleteOne()
  @AccessControlDeleteOne(InvitationResource.One)
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.invitationCrudService.deleteOne(crudRequest);
  }
}
