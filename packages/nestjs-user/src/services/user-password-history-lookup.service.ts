import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { LookupService, QueryOptionsInterface } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';

import { USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY } from '../user.constants';
import { UserPasswordHistoryEntityInterface } from '../interfaces/user-password-history-entity.interface';
import { ReferenceId } from '@concepta/nestjs-common';

@Injectable()
export class UserPasswordHistoryLookupService extends LookupService<UserPasswordHistoryEntityInterface> {
  constructor(
    @InjectDynamicRepository(USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY)
    protected readonly userPasswordHistoryRepo: Repository<UserPasswordHistoryEntityInterface>,
  ) {
    super(userPasswordHistoryRepo);
  }

  async byUserId(userId: ReferenceId, queryOptions?: QueryOptionsInterface) {
    return this.repository(queryOptions).findBy({ userId });
  }
}
