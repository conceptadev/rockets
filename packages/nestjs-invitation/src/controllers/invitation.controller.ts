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

import { InvitationCreateOneDto } from '../dto/invitation-create-one.dto';
import { InvitationPaginatedDto } from '../dto/invitation-paginated.dto';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationException } from '../exceptions/invitation.exception';
import { InvitationCreateOneInterface } from '../interfaces/invitation-create-one.interface';
import { InvitationResource } from '../invitation.types';
import { InvitationCrudService } from '../services/invitation-crud.service';
import { InvitationSendService } from '../services/invitation-send.service';

@CrudController({
  path: 'invitation',
  model: {
    type: InvitationDto,
    paginatedType: InvitationPaginatedDto,
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
      InvitationCreateOneInterface,
      InvitationCreateOneInterface
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
    @CrudRequest() _crudRequest: CrudRequestInterface,
    @CrudBody() invitationCreateOneDto: InvitationCreateOneDto,
  ) {
    let invite:
      | Required<Pick<InvitationInterface, 'id' | 'user' | 'code' | 'category'>>
      | undefined;

    try {
      await this.invitationCrudService
        .transaction()
        .commit(async (transaction): Promise<void> => {
          invite = await this.invitationSendService.create(
            invitationCreateOneDto,
            {
              transaction,
            },
          );

          if (invite !== undefined && invite.user !== undefined) {
            await this.invitationSendService.send(invite, {
              transaction,
            });
          } else {
            throw new Error('User and/or invite not defined');
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
