import { Inject, Injectable } from '@nestjs/common';

import { AuthVerifyServiceInterface } from '../interfaces/auth-verify.service.interface';
import { AuthVerifySettingsInterface } from '../interfaces/auth-verify-settings.interface';
import { AuthVerifyOtpServiceInterface } from '../interfaces/auth-verify-otp.service.interface';
import { AuthVerifyUserModelServiceInterface } from '../interfaces/auth-verify-user-model.service.interface';
import {
  AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
  AuthVerifyOtpService,
  AuthVerifyUserModelService,
} from '../auth-verify.constants';
import { AuthVerifyNotificationService } from './auth-verify-notification.service';
import {
  AssigneeRelationInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
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
    @Inject(AuthVerifyUserModelService)
    private readonly userModelService: AuthVerifyUserModelServiceInterface,
    @Inject(AuthVerifyNotificationService)
    private readonly notificationService: AuthVerifyNotificationServiceInterface,
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
    const { email } = params;

    // verify the user by providing an email
    const user = await this.userModelService.byEmail(email);

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
          assigneeId: user.id,
        },
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
  ): Promise<AssigneeRelationInterface | null> {
    const { passcode, deleteIfValid = false } = params;
    // extract required properties
    const { category, assignment } = this.config.otp;

    // validate passcode return passcode's user was found
    return this.otpService.validate(
      assignment,
      { category, passcode },
      deleteIfValid,
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
    const { passcode } = params;

    // get otp by passcode, but no delete it until all workflow pass
    const otp = await this.validatePasscode({
      passcode,
      deleteIfValid: true,
    });

    // did we get an otp?
    if (otp) {
      // call user model service
      const user = await this.userModelService.update({
        id: otp.assigneeId,
        active: true,
      });

      if (user) {
        await this.revokeAllUserVerifyToken({
          email: user.email,
        });

        return user;
      }
    }

    // otp was not found
    throw new AuthRecoveryOtpInvalidException();
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
    const { email } = params;
    // verify user by providing an email
    const user = await this.userModelService.byEmail(email);

    // did we find a user?
    if (user) {
      // extract required otp properties
      const { category, assignment } = this.config.otp;
      // clear all user's otps in DB
      await this.otpService.clear(assignment, {
        category,
        assigneeId: user.id,
      });
    }
  }
}
