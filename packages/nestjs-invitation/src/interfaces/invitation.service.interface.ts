import { InvitationInterface } from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { InvitationAcceptOptionsInterface } from './invitation-accept-options.interface';
import { InvitationCreateInviteInterface } from './invitation-create-invite.interface';
import { InvitationRevokeOptionsInterface } from './invitation-revoke-options.interface';

export interface InvitationServiceInterface {
  create(
    createInviteDto: InvitationCreateInviteInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Required<Pick<InvitationInterface, 'id' | 'user'>>>;

  send(
    invitation: Pick<InvitationInterface, 'id'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;

  accept(
    options: InvitationAcceptOptionsInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean>;

  revokeAll(
    options: InvitationRevokeOptionsInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;
}
