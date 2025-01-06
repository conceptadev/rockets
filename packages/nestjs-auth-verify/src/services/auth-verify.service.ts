import { Inject, Injectable } from '@nestjs/common';

import { AuthVerifyServiceInterface } from '../interfaces/auth-verify.service.interface';
import { AuthVerifySettingsInterface } from '../interfaces/auth-verify-settings.interface';
import { AuthVerifyOtpServiceInterface } from '../interfaces/auth-verify-otp.service.interface';
import { AuthVerifyUserLookupServiceInterface } from '../interfaces/auth-verify-user-lookup.service.interface';
import { AuthVerifyUserMutateServiceInterface } from '../interfaces/auth-verify-user-mutate.service.interface';
import {
  AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
  AUTH_VERIFY_MODULE_OTP_SERVICE_TOKEN,
  AUTH_VERIFY_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_VERIFY_MODULE_USER_MUTATE_SERVICE_TOKEN,
  AUTH_VERIFY_MODULE_ENTITY_MANAGER_PROXY_TOKEN,
} from '../auth-verify.constants';
import { AuthVerifyNotificationService } from './auth-verify-notification.service';
import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import {
  EntityManagerProxy,
  QueryOptionsInterface,
} from '@concepta/typeorm-common';

@Injectable()
export class AuthVerifyService implements AuthVerifyServiceInterface {
  constructor(
    @Inject(AUTH_VERIFY_MODULE_SETTINGS_TOKEN)
    private readonly config: AuthVerifySettingsInterface,
    @Inject(AUTH_VERIFY_MODULE_OTP_SERVICE_TOKEN)
    private readonly otpService: AuthVerifyOtpServiceInterface,
    @Inject(AUTH_VERIFY_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    private readonly userLookupService: AuthVerifyUserLookupServiceInterface,
    @Inject(AUTH_VERIFY_MODULE_USER_MUTATE_SERVICE_TOKEN)
    private readonly userMutateService: AuthVerifyUserMutateServiceInterface,
    private readonly notificationService: AuthVerifyNotificationService,
    @Inject(AUTH_VERIFY_MODULE_ENTITY_MANAGER_PROXY_TOKEN)
    private readonly entityManagerProxy: EntityManagerProxy,
  ) {}

  /**
   * Send email to verify email.
   *
   * @param email - user email
   */
  async send(
    email: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    // verify the user by providing an email
    const user = await this.userLookupService.byEmail(email, queryOptions);

    // did we find a user?
    if (user) {
      // extract required otp properties
      const { category, assignment, type, expiresIn } = this.config.otp;
      // create an OTP save it in the database
      const otp = await this.otpService.create({
        assignment,
        otp: {
          category,
          type,
          expiresIn,
          assignee: {
            id: user.id,
          },
        },
        queryOptions,
      });

      // send en email with a verify OTP
      await this.notificationService.sendVerifyEmail(
        email,
        otp.passcode,
        otp.expirationDate,
      );
    }

    // !!! Falling through to void is intentional              !!!!
    // !!! Do NOT give any indication if e-mail does not exist !!!!
  }

  /**
   * Validate passcode and return it's user.
   *
   * @param passcode - user's passcode
   * @param deleteIfValid - flag to delete if valid or not
   */
  async validatePasscode(
    passcode: string,
    deleteIfValid = false,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReferenceAssigneeInterface | null> {
    // extract required properties
    const { category, assignment } = this.config.otp;

    // validate passcode return passcode's user was found
    return this.otpService.validate(
      assignment,
      { category, passcode },
      deleteIfValid,
      queryOptions,
    );
  }

  /**
   * Change user's password by providing it's OTP passcode and the new password.
   *
   * @param passcode - OTP user's passcode
   * @param queryOptions - query options
   */
  async confirmUser(
    passcode: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReferenceIdInterface | null> {
    // run in transaction
    return this.entityManagerProxy
      .transaction(queryOptions)
      .commit(async (transaction): Promise<ReferenceIdInterface | null> => {
        // nested query options
        const nestedQueryOptions = { ...queryOptions, transaction };

        // get otp by passcode, but no delete it until all workflow pass
        const otp = await this.validatePasscode(
          passcode,
          true,
          nestedQueryOptions,
        );

        // did we get an otp?
        if (otp) {
          // call user mutate service
          const user = await this.userMutateService.update(
            {
              id: otp.assignee.id,
              active: true,
            },
            nestedQueryOptions,
          );

          if (user) {
            await this.revokeAllUserVerifyToken(user.email, nestedQueryOptions);
          }

          return user;
        }

        // otp was not found
        return null;
      });
  }

  /**
   * Clear all other user verify tokens
   *
   * @param email - user email
   */
  async revokeAllUserVerifyToken(
    email: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    // verify users password by providing an email
    const user = await this.userLookupService.byEmail(email, queryOptions);

    // did we find a user?
    if (user) {
      // extract required otp properties
      const { category, assignment } = this.config.otp;
      // clear all user's otps in DB
      await this.otpService.clear(
        assignment,
        {
          category,
          assignee: {
            id: user.id,
          },
        },
        queryOptions,
      );
    }
  }
}
