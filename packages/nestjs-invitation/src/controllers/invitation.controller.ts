import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
import {
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
} from '@concepta/nestjs-access-control';

import { InvitationCreateDto } from '../dto/invitation-create.dto';
import { InvitationDto } from '../dto/invitation.dto';
import { InvitationPaginatedDto } from '../dto/invitation-paginated.dto';
import { InvitationCreatableInterface } from '../interfaces/invitation-creatable.interface';
import { InvitationResource } from '../invitation.types';
import { InvitationCrudService } from '../services/invitation-crud.service';
import { InvitationSendService } from '../services/invitation-send.service';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';
import { InvitationException } from '../exceptions/invitation.exception';
import { InvitationMutateService } from '../services/invitation-mutate.service';
import { randomUUID } from 'crypto';

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
      InvitationCreatableInterface,
      InvitationCreatableInterface
    >
{
  constructor(
    private readonly invitationSendService: InvitationSendService,
    private readonly invitationCrudService: InvitationCrudService,
    private readonly invitationMutateService: InvitationMutateService,
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
    @CrudBody() invitationCreateDto: InvitationCreateDto,
  ) {
    const { email, category, payload } = invitationCreateDto;
    let invite: InvitationEntityInterface | undefined;

    try {
      await this.invitationCrudService
        .transaction()
        .commit(async (transaction): Promise<void> => {
          const user = await this.invitationSendService.getUser(
            email,
            payload,
            {
              transaction,
            },
          );

          invite = await this.invitationMutateService.create(
            {
              user: user,
              email,
              category,
              payload: payload,
              code: randomUUID(),
              constraints: payload,
            },
            {
              transaction,
            },
          );

          if (user !== undefined && invite !== undefined) {
            await this.invitationSendService.send(user, invite.code, category, {
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
