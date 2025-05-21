import { Inject, Injectable } from '@nestjs/common';
import {
  ReferenceId,
  ReferenceIdInterface,
  RepositoryInternals,
  PasswordStorageInterface,
  UserPasswordHistoryEntityInterface,
} from '@concepta/nestjs-common';

import { UserPasswordHistoryModelService } from './user-password-history-model.service';

import { UserException } from '../exceptions/user-exception';
import { UserPasswordHistoryServiceInterface } from '../interfaces/user-password-history-service.interface';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';

@Injectable()
export class UserPasswordHistoryService
  implements UserPasswordHistoryServiceInterface
{
  constructor(
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    protected readonly userSettings: UserSettingsInterface,
    @Inject(UserPasswordHistoryModelService)
    protected readonly userPasswordHistoryModelService: UserPasswordHistoryModelService,
  ) {}

  async getHistory(
    userId: ReferenceId,
  ): Promise<(ReferenceIdInterface & PasswordStorageInterface)[]> {
    let history: (ReferenceIdInterface & PasswordStorageInterface)[] | null;

    try {
      // try to find the history
      history = await this.userPasswordHistoryModelService.find(
        this.getHistoryFindManyOptions(userId),
      );
    } catch (e: unknown) {
      throw new UserException({
        message:
          'Cannot update password, error while getting password history by user id',
        originalError: e,
      });
    }

    // return history if found or empty array
    return history ?? [];
  }

  async pushHistory(
    userId: string,
    passwordStore: PasswordStorageInterface,
  ): Promise<void> {
    try {
      await this.userPasswordHistoryModelService.create({
        userId,
        ...passwordStore,
      });
    } catch (e: unknown) {
      throw new UserException({
        message:
          'Cannot update password, error while pushing password history by user id',
        originalError: e,
      });
    }
  }

  protected getHistoryFindManyOptions(
    userId: ReferenceId,
  ): RepositoryInternals.FindManyOptions<UserPasswordHistoryEntityInterface> {
    // the base query
    const query: RepositoryInternals.FindManyOptions<UserPasswordHistoryEntityInterface> & {
      where: {
        userId: ReferenceId;
        dateCreated?: ReturnType<UserPasswordHistoryModelService['gt']>;
      };
    } = {
      where: {
        userId,
      },
      order: {
        dateCreated: 'ASC',
      },
    };

    // is there a limit days setting?
    if (this.userSettings?.passwordHistory?.limitDays) {
      // our limit date
      const limitDate = new Date();
      // subtract limit days setting
      limitDate.setDate(
        limitDate.getDate() - this.userSettings.passwordHistory.limitDays,
      );
      // set the created at query
      query.where.dateCreated =
        this.userPasswordHistoryModelService.gt(limitDate);
    }

    return query;
  }
}
