import { registerAs } from '@nestjs/config';
import { INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN } from '../invitation.constants';
import { InvitationSettingsInterface } from '../interfaces/invitation-settings.interface';

/**
 * Default configuration for auth github.
 */
export const invitationDefaultConfig = registerAs(
  INVITATION_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): InvitationSettingsInterface => ({
    email: {
      from: 'from',
      baseUrl: 'baseUrl',
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
      assignment: 'userOtp',
      type: 'uuid',
      expiresIn: '1h',
    },
  }),
);
