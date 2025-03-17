import {
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
} from '@concepta/nestjs-access-control';
import { InvitationInterface } from '@concepta/nestjs-common';
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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { InvitationCreateInviteDto } from '../dto/invitation-create-invite.dto';
import { InvitationPaginatedDto } from '../dto/invitation-paginated.dto';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationException } from '../exceptions/invitation.exception';
import { InvitationCreateInviteInterface } from '../interfaces/domain/invitation-create-invite.interface';
import { InvitationSendInviteInterface } from '../interfaces/domain/invitation-send-invite.interface';
import { InvitationResource } from '../invitation.types';
import { InvitationCrudService } from '../services/invitation-crud.service';
import { InvitationSendService } from '../services/invitation-send.service';

@CrudController({
  path: 'invitation',
  model: {
    type: InvitationDto,
    paginatedType: InvitationPaginatedDto,
  },
  join: {
    user: {
      eager: true,
      allow: ['id', 'email'],
    },
  },
  validation: {
    transformOptions: {
      // TODO temporary fix because this could be unsafe
      excludeExtraneousValues: false,
    },
  },
})
@ApiTags('invitation')
export class InvitationController
  implements
    CrudControllerInterface<
      InvitationInterface,
      InvitationCreateInviteInterface,
      never
    >
{
  constructor(
    private readonly invitationCrudService: InvitationCrudService,
    private readonly invitationSendService: InvitationSendService,
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
  async createInvite(
    @CrudRequest() _crudRequest: CrudRequestInterface,
    @CrudBody() invitationCreateInviteDto: InvitationCreateInviteDto,
  ) {
    let invite: InvitationSendInviteInterface | undefined;

    try {
      await this.invitationCrudService
        .transaction()
        .commit(async (transaction): Promise<void> => {
          invite = await this.invitationSendService.create(
            invitationCreateInviteDto,
            {
              transaction,
            },
          );

          if (invite) {
            await this.invitationSendService.send(invite, {
              transaction,
            });
          } else {
            throw new InvitationException({
              message: 'User and/or invite not defined',
            });
          }
        });

      return invite;
    } catch (e: unknown) {
      throw new InvitationException({ originalError: e });
    }
  }

  @CrudDeleteOne()
  @AccessControlDeleteOne(InvitationResource.One)
  @ApiOperation({
    summary: 'Delete one invitation.',
  })
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    try {
      return this.invitationCrudService.deleteOne(crudRequest);
    } catch (e: unknown) {
      throw new InvitationException({ originalError: e });
    }
  }
}
