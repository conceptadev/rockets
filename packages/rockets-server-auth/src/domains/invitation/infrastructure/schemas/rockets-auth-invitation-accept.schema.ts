import { invitationAcceptSchema } from '@concepta/nestjs-invitation';
import { withOpenApi } from '@concepta/rockets-core';

/** `PATCH /invitation-acceptance/:code` body — upstream shape, Rockets component id. */
export const rocketsAuthInvitationAcceptSchema = withOpenApi(
  invitationAcceptSchema.extend({}),
  'RocketsAuthInvitationAcceptDto',
);
