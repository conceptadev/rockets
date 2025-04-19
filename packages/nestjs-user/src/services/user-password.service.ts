import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import {
  ReferenceId,
  ReferenceIdInterface,
  isPasswordStorage,
  AuthenticatedUserInterface,
  PasswordPlainCurrentInterface,
  PasswordPlainInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-common';
import {
  PasswordCreationService,
  PasswordCreationServiceInterface,
  PasswordStorageService,
  PasswordStorageServiceInterface,
} from '@concepta/nestjs-password';

import { UserPasswordServiceInterface } from '../interfaces/user-password-service.interface';
import { UserPasswordHistoryServiceInterface } from '../interfaces/user-password-history-service.interface';
import { UserPasswordHistoryService } from './user-password-history.service';
import { UserException } from '../exceptions/user-exception';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';
import { UserModelServiceInterface } from '../interfaces/user-model-service.interface';
import { UserModelService } from './user-model.service';

/**
 * User password service
 */
@Injectable()
export class UserPasswordService implements UserPasswordServiceInterface {
  /**
   * Constructor
   *
   * @param userModelService - user model service
   * @param passwordCreationService - password creation service
   * @param passwordStorageService - password storage service
   * @param userPasswordHistoryService - user password history creation service
   */
  constructor(
    @Inject(forwardRef(() => UserModelService))
    protected readonly userModelService: UserModelServiceInterface,
    @Inject(PasswordCreationService)
    protected readonly passwordCreationService: PasswordCreationServiceInterface,
    @Inject(PasswordStorageService)
    protected readonly passwordStorageService: PasswordStorageServiceInterface,
    @Optional()
    @Inject(UserPasswordHistoryService)
    private userPasswordHistoryService?: UserPasswordHistoryServiceInterface,
  ) {}

  async setPassword(
    passwordDto: PasswordPlainInterface &
      Partial<PasswordPlainCurrentInterface>,
    userToUpdateId?: ReferenceId,
    authorizedUser?: AuthenticatedUserInterface,
  ): Promise<void> {
    // break out the password
    const { password } = passwordDto;

    // user to update
    let userToUpdate:
      | (ReferenceIdInterface & PasswordStorageInterface)
      | undefined = undefined;

    // are we updating?
    if (userToUpdateId) {
      // yes, get the user
      userToUpdate = await this.getPasswordStore(userToUpdateId);

      // call current password validation helper
      await this.validateCurrent(
        userToUpdate,
        passwordDto?.passwordCurrent,
        authorizedUser,
      );

      // call password history validation helper
      await this.validateHistory(userToUpdate, password);
    }

    // call the password creation service
    const passwordHashed = await this.passwordStorageService.hash(password);

    // push password history if necessary
    if (
      this.userPasswordHistoryService &&
      userToUpdate &&
      isPasswordStorage(passwordHashed)
    ) {
      await this.userPasswordHistoryService.pushHistory(
        userToUpdate.id,
        passwordHashed,
      );
    }

    // update the user
    if (userToUpdate) {
      await this.userModelService.update({
        id: userToUpdate.id,
        passwordHash: passwordHashed.passwordHash,
        passwordSalt: passwordHashed.passwordSalt,
      });
    }
  }

  async getPasswordStore(
    userId: ReferenceId,
  ): Promise<ReferenceIdInterface & PasswordStorageInterface> {
    let user: (ReferenceIdInterface & Partial<PasswordStorageInterface>) | null;

    try {
      // try to lookup the user
      user = await this.userModelService.byId(userId);
    } catch (e: unknown) {
      throw new UserException({
        message: 'Cannot update password, error while getting user by id',
        originalError: e,
      });
    }

    // did we get a user?
    if (user) {
      // break out the stored password
      const { passwordHash, passwordSalt } = user;

      // return the user with asserted storage types
      return {
        ...user,
        passwordHash: typeof passwordHash === 'string' ? passwordHash : '',
        passwordSalt: typeof passwordSalt === 'string' ? passwordSalt : '',
      };
    }

    // throw an exception by default
    throw new UserNotFoundException({
      message: 'Impossible to update password if user is not found',
    });
  }

  protected async validateCurrent(
    target: ReferenceIdInterface & PasswordStorageInterface,
    password?: string,
    authorizedUser?: AuthenticatedUserInterface,
  ): Promise<boolean> {
    // is the user updating their own password?
    if (target.id === authorizedUser?.id) {
      // call current password validation helper
      const currentIsValid = await this.passwordCreationService.validateCurrent(
        {
          password,
          target,
        },
      );

      if (currentIsValid) {
        return true;
      } else {
        throw new UserException({
          message: `Current password is not valid`,
          httpStatus: HttpStatus.BAD_REQUEST,
        });
      }
    }

    // return true by default
    return true;
  }

  protected async validateHistory(
    user: ReferenceIdInterface,
    password?: string,
  ): Promise<boolean> {
    // was a history service injected?
    if (this.userPasswordHistoryService) {
      // get password history for user
      const passwordHistory = await this.userPasswordHistoryService.getHistory(
        user.id,
      );

      // call password history validation helper
      const isValid = await this.passwordCreationService.validateHistory({
        password,
        targets: passwordHistory,
      });

      if (!isValid) {
        throw new UserException({
          message: `Password has been used too recently.`,
          httpStatus: HttpStatus.BAD_REQUEST,
        });
      }
    }

    // return true by default
    return true;
  }
}
