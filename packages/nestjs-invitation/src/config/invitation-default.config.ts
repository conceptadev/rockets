import { registerAs } from '@nestjs/config';
import { INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN } from '../invitation.constants';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';

/**
 * Default configuration for invitation.
 */
export const invitationDefaultConfig = registerAs(
  INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): InvitationSettingsInterface => ({
    email: {
      from: 'no-reply@dispostable.com',
      baseUrl: 'http://localhost:3000',
      templates: {
        invitation: {
          fileName: __dirname + '/../assets/invitation.template.hbs',
          subject: 'Access Invitation',
        },
        invitationAccepted: {
          fileName: __dirname + '/../assets/invitation-accepted.template.hbs',
          subject: 'Invitation Accepted',
        },
      },
    },
    otp: {
      assignment: 'user-otp',
      type: 'uuid',
      expiresIn: '7d',
      clearOtpOnCreate: process.env.INVITATION_OTP_CLEAR_ON_CREATE
        ? process.env.INVITATION_OTP_CLEAR_ON_CREATE === 'true'
        : undefined,
    },
  }),
);
