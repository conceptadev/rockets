import { DeepPartial, Repository } from 'typeorm';
import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { MutateService } from '@concepta/typeorm-common';
import {
  PasswordPlainInterface,
  UserCreatableInterface,
  UserUpdatableInterface,
} from '@concepta/ts-common';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { EventListenService } from '@concepta/nestjs-event';

import { UserEntityInterface } from '../interfaces/user-entity.interface';
import { UserMutateServiceInterface } from '../interfaces/user-mutate-service.interface';
import { UserCreateDto } from '../dto/user-create.dto';
import { UserUpdateDto } from '../dto/user-update.dto';
import {
  USER_MODULE_SETTINGS_TOKEN,
  USER_MODULE_USER_ENTITY_KEY,
} from '../user.constants';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { CreateUserListener } from '../listeners/create-user-listener';

/**
 * User mutate service
 */
@Injectable()
export class UserMutateService
  extends MutateService<
    UserEntityInterface,
    UserCreatableInterface,
    UserUpdatableInterface
  >
  implements UserMutateServiceInterface, OnModuleInit
{
  protected createDto = UserCreateDto;
  protected updateDto = UserUpdateDto;

  /**
   * Constructor
   *
   * @param repo instance of the user repo
   * @param passwordStorageService
   * @param settings
   * @param eventListenService
   */
  constructor(
    @InjectDynamicRepository(USER_MODULE_USER_ENTITY_KEY)
    protected repo: Repository<UserEntityInterface>,
    private passwordStorageService: PasswordStorageService,
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    private settings: UserSettingsInterface,
    @Optional()
    @Inject(EventListenService)
    private eventListenService?: EventListenService,
  ) {
    super(repo);
  }

  onModuleInit() {
    if (this.eventListenService && this.settings.invitationSignupEvent) {
      const createUserListener = new CreateUserListener(this.repo, this);
      this.eventListenService.on(
        this.settings.invitationSignupEvent,
        createUserListener,
      );
    }
  }

  async save<T extends DeepPartial<UserEntityInterface>>(
    user: T | (T & PasswordPlainInterface),
  ): Promise<UserEntityInterface> {
    // do we need to hash the password?
    if ('password' in user && user.password.length) {
      // yes, hash it
      const hashedUser = await this.passwordStorageService.hashObject(user);
      // save it
      return super.save(hashedUser);
    } else {
      // save it
      return super.save(user);
    }
  }
}
