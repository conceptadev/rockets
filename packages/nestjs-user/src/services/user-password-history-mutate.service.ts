import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MutateService } from '@concepta/typeorm-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';

import { USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY } from '../user.constants';
import { UserPasswordHistoryEntityInterface } from '../interfaces/user-password-history-entity.interface';
import { UserPasswordHistoryCreatableInterface } from '../interfaces/user-password-history-creatable.interface';
import { UserPasswordHistoryCreateDto } from '../dto/user-password-history-create.dto';

@Injectable()
export class UserPasswordHistoryMutateService extends MutateService<
  UserPasswordHistoryEntityInterface,
  UserPasswordHistoryCreatableInterface,
  never,
  never
> {
  constructor(
    @InjectDynamicRepository(USER_MODULE_USER_PASSWORD_HISTORY_ENTITY_KEY)
    protected readonly userPasswordHistoryRepo: Repository<UserPasswordHistoryEntityInterface>,
  ) {
    super(userPasswordHistoryRepo);
  }

  protected createDto = UserPasswordHistoryCreateDto;
  protected updateDto!: never;
}
