import { Injectable } from '@nestjs/common';
import {
  ModelService,
  ReferenceId,
  RepositoryInterface,
  InjectDynamicRepository,
} from '@concepta/nestjs-common';

import { USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY } from '../user.constants';
import { UserPasswordHistoryEntityInterface } from '@concepta/nestjs-common';
import { UserPasswordHistoryCreatableInterface } from '../interfaces/user-password-history-creatable.interface';
import { UserPasswordHistoryCreateDto } from '../dto/user-password-history-create.dto';

@Injectable()
export class UserPasswordHistoryModelService extends ModelService<
  UserPasswordHistoryEntityInterface,
  UserPasswordHistoryCreatableInterface,
  never,
  never
> {
  constructor(
    @InjectDynamicRepository(USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY)
    protected readonly userPasswordHistoryRepo: RepositoryInterface<UserPasswordHistoryEntityInterface>,
  ) {
    super(userPasswordHistoryRepo);
  }

  async byUserId(userId: ReferenceId) {
    return this.userPasswordHistoryRepo.findBy({ userId });
  }

  protected createDto = UserPasswordHistoryCreateDto;
  protected updateDto!: never;
}
