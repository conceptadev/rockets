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
import { InvitationInterface } from '@concepta/ts-common';

import { InvitationCreateDto } from '../dto/invitation-create.dto';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationPaginatedDto } from '../dto/invitation-paginated.dto';
import { InvitationCreatableInterface } from '../interfaces/invitation-creatable.interface';
import {
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
} from '@concepta/nestjs-access-control';
import { InvitationResource } from '../invitation.types';
import { InvitationCrudService } from '../services/invitation-crud.service';
import { randomUUID } from 'crypto';
import { InvitationSendService } from '../services/invitation-send.service';

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
    private readonly invitationSendService: InvitationSendService,
    private readonly invitationCrudService: InvitationCrudService,
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
    const user = await this.invitationSendService.getOrCreateOneUser(email);

    const invite = await this.invitationCrudService.createOne(crudRequest, {
      user,
      email,
      category,
      code: randomUUID(),
    });

    await this.invitationSendService.send(user, invite.code, category);

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
