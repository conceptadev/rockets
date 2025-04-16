import { Injectable } from '@nestjs/common';
import { ReferenceId, RepositoryInterface } from '@concepta/nestjs-common';
import { LookupService } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';

import { USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY } from '../user.constants';
import { UserPasswordHistoryEntityInterface } from '../interfaces/user-password-history-entity.interface';

@Injectable()
export class UserPasswordHistoryLookupService extends LookupService<UserPasswordHistoryEntityInterface> {
  constructor(
    @InjectDynamicRepository(USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY)
    protected readonly userPasswordHistoryRepo: RepositoryInterface<UserPasswordHistoryEntityInterface>,
  ) {
    super(userPasswordHistoryRepo);
  }

  async byUserId(userId: ReferenceId) {
    return this.userPasswordHistoryRepo.findBy({ userId });
  }
}
