import { Inject, Injectable } from '@nestjs/common';

import { AuthVerifyServiceInterface } from '../interfaces/auth-verify.service.interface';
import { AuthVerifySettingsInterface } from '../interfaces/auth-verify-settings.interface';
import { AuthVerifyOtpServiceInterface } from '../interfaces/auth-verify-otp.service.interface';
import { AuthVerifyUserLookupServiceInterface } from '../interfaces/auth-verify-user-lookup.service.interface';
import { AuthVerifyUserMutateServiceInterface } from '../interfaces/auth-verify-user-mutate.service.interface';
import {
  AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
  AUTH_VERIFY_MODULE_ENTITY_MANAGER_PROXY_TOKEN,
  AuthVerifyOtpService,
  AuthVerifyUserLookupService,
  AuthVerifyUserMutateService,
} from '../auth-verify.constants';
import { AuthVerifyNotificationService } from './auth-verify-notification.service';
import {
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { EntityManagerProxy } from '@concepta/typeorm-common';
import { AuthVerifySendParamsInterface } from '../interfaces/auth-verify-send-params.interface';
import { AuthVerifyConfirmParamsInterface } from '../interfaces/auth-verify-confirm-params.interface';
import { AuthVerifyRevokeParamsInterface } from '../interfaces/auth-verify-revoke-params.interface';
import { AuthVerifyValidateParamsInterface } from '../interfaces/auth-verify-validate-params.interface';
import { AuthVerifyNotificationServiceInterface } from '../interfaces/auth-verify-notification.service.interface';
import { AuthRecoveryOtpInvalidException } from '../exceptions/auth-verify-otp-invalid.exception';

@Injectable()
export class AuthVerifyService implements AuthVerifyServiceInterface {
  constructor(
    @Inject(AUTH_VERIFY_MODULE_SETTINGS_TOKEN)
    private readonly config: AuthVerifySettingsInterface,
    @Inject(AuthVerifyOtpService)
    private readonly otpService: AuthVerifyOtpServiceInterface,
    @Inject(AuthVerifyUserLookupService)
    private readonly userLookupService: AuthVerifyUserLookupServiceInterface,
    @Inject(AuthVerifyUserMutateService)
    private readonly userMutateService: AuthVerifyUserMutateServiceInterface,
    @Inject(AuthVerifyNotificationService)
    private readonly notificationService: AuthVerifyNotificationServiceInterface,
    @Inject(AUTH_VERIFY_MODULE_ENTITY_MANAGER_PROXY_TOKEN)
    private readonly entityManagerProxy: EntityManagerProxy,
  ) {}

  /**
   * Send an email to verify a user's email address.
   *
   * This method:
   * 1. Looks up the user by email
   * 2. If found, creates a one-time passcode (OTP)
   * 3. Sends verification email with the OTP
   * 4. Returns void regardless of whether user exists (for security)
   *
   * @param params - Parameters for sending verification email
   */
  async send(params: AuthVerifySendParamsInterface): Promise<void> {
    const { email, queryOptions } = params;

    // verify the user by providing an email
    const user = await this.userLookupService.byEmail(email, queryOptions);

    // did we find a user?
    if (user) {
      // extract required otp properties
      const {
        category,
        assignment,
        type,
        expiresIn,
        clearOtpOnCreate,
        rateSeconds,
        rateThreshold,
      } = this.config.otp;

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
        clearOnCreate: clearOtpOnCreate,
        rateSeconds,
        rateThreshold,
      });

      // send en email with a verify OTP
      await this.notificationService.sendVerifyEmail({
        email,
        passcode: otp.passcode,
        resetTokenExp: otp.expirationDate,
      });
    }

    // !!! Falling through to void is intentional              !!!!
    // !!! Do NOT give any indication if e-mail does not exist !!!!
  }

  /**
   * Send an email to verify a user's email address.
   *
   * This method:
   * 1. Looks up the user by email
   * 2. If found, creates a one-time passcode (OTP)
   * 3. Sends verification email with the OTP
   * 4. Returns void regardless of whether user exists (for security)
   *
   * @param params - Parameters for sending verification email
   */
  async validatePasscode(
    params: AuthVerifyValidateParamsInterface,
  ): Promise<ReferenceAssigneeInterface | null> {
    const { passcode, deleteIfValid = false, queryOptions } = params;
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
   * Confirms a user's account by validating their OTP passcode.
   *
   * This method:
   * 1. Validates the provided OTP passcode
   * 2. If valid, marks the user's account as active
   * 3. Revokes all other verification tokens for this user
   * 4. Returns the updated user if successful, null if invalid passcode
   *
   * @param params - Parameters for confirming user
   */
  async confirmUser(
    params: AuthVerifyConfirmParamsInterface,
  ): Promise<ReferenceIdInterface | null> {
    const { passcode, queryOptions } = params;
    // run in transaction
    return this.entityManagerProxy
      .transaction(queryOptions)
      .commit(async (transaction): Promise<ReferenceIdInterface | null> => {
        // nested query options
        const nestedQueryOptions = { ...queryOptions, transaction };

        // get otp by passcode, but no delete it until all workflow pass
        const otp = await this.validatePasscode({
          passcode,
          deleteIfValid: true,
          queryOptions: nestedQueryOptions,
        });

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
            await this.revokeAllUserVerifyToken({
              email: user.email,
              queryOptions: nestedQueryOptions,
            });

            return user;
          }
        }

        // otp was not found
        throw new AuthRecoveryOtpInvalidException();
      });
  }

  /**
   * Revokes all verification tokens for a given user
   *
   * @param params - Parameters for revoking tokens
   * @returns Promise that resolves when tokens are revoked
   */
  async revokeAllUserVerifyToken(
    params: AuthVerifyRevokeParamsInterface,
  ): Promise<void> {
    const { email, queryOptions } = params;
    // verify user by providing an email
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
