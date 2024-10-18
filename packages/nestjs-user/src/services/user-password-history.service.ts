import { MoreThan } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ReferenceId, ReferenceIdInterface } from '@concepta/ts-core';
import { PasswordStorageInterface } from '@concepta/nestjs-password';

import { UserPasswordHistoryLookupService } from './user-password-history-lookup.service';
import { UserPasswordHistoryMutateService } from './user-password-history-mutate.service';

import { UserException } from '../exceptions/user-exception';
import { UserPasswordHistoryServiceInterface } from '../interfaces/user-password-history-service.interface';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class UserPasswordHistoryService
  implements UserPasswordHistoryServiceInterface
{
  constructor(
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    protected readonly userSettings: UserSettingsInterface,
    @Inject(UserPasswordHistoryLookupService)
    protected readonly userPasswordHistoryLookupService: UserPasswordHistoryLookupService,
    @Inject(UserPasswordHistoryMutateService)
    protected readonly userPasswordHistoryMutateService: UserPasswordHistoryMutateService,
  ) {}

  async getHistory(
    userId: ReferenceId,
    queryOptions?: QueryOptionsInterface,
  ): Promise<(ReferenceIdInterface & PasswordStorageInterface)[]> {
    let history: (ReferenceIdInterface & PasswordStorageInterface)[] | null;

    try {
      // try to lookup the user
      history = await this.userPasswordHistoryLookupService.find(
        this.getHistoryFindManyOptions(userId),
        queryOptions,
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
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    try {
      await this.userPasswordHistoryMutateService.create(
        {
          userId,
          ...passwordStore,
        },
        queryOptions,
      );
    } catch (e: unknown) {
      throw new UserException({
        message:
          'Cannot update password, error while pushing password history by user id',
        originalError: e,
      });
    }
  }

  protected getHistoryFindManyOptions(userId: ReferenceId): FindManyOptions {
    // the base query
    const query: FindManyOptions & {
      where: {
        userId: ReferenceId;
        dateCreated?: ReturnType<typeof MoreThan>;
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
      query.where.dateCreated = MoreThan(limitDate);
    }

    return query;
  }
}
