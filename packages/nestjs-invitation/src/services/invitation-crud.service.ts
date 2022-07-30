import { Repository } from 'typeorm';
import {
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { Inject, Injectable } from '@nestjs/common';

import { InvitationUserLookupServiceInterface } from '../interfaces/invitation-user-lookup.service.interface';
import { InvitationUserMutateServiceInterface } from '../interfaces/invitation-user-mutate.service.interface';
import {
  INVITATION_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_USER_MUTATE_SERVICE_TOKEN,
  INVITATION_MODULE_INVITATION_ENTITY_KEY,
} from '../invitation.constants';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';
import { InvitationDto } from '../dto/invitation.dto';

@Injectable()
export class InvitationCrudService extends TypeOrmCrudService<InvitationEntityInterface> {
  constructor(
    @InjectDynamicRepository(INVITATION_MODULE_INVITATION_ENTITY_KEY)
    private invitationRepo: Repository<InvitationEntityInterface>,
    @Inject(INVITATION_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: InvitationUserLookupServiceInterface,
    @Inject(INVITATION_USER_MUTATE_SERVICE_TOKEN)
    private readonly userMutateService: InvitationUserMutateServiceInterface,
  ) {
    super(invitationRepo);
  }

  async getOrCreateOneUser(
    email: string,
  ): Promise<ReferenceIdInterface & ReferenceUsernameInterface> {
    let user = await this.userLookupService.byEmail(email);

    if (!user) {
      user = await this.userMutateService.create({
        email,
        username: email,
      });
    }

    return user;
  }

  async getOneByCode(code: string): Promise<InvitationDto | null> {
    return await this.invitationRepo.findOneBy({ code });
  }
}
