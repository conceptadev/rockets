import { InvitationInterface } from '@concepta/nestjs-common/src';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { InvitationAcceptOptionsInterface } from './invitation-accept-options.interface';
import { InvitationCreatableInterface } from './invitation-creatable.interface';
import { InvitationRevokeOptionsInterface } from './invitation-revoke-options.interface';

export interface InvitationServiceInterface {
  create(
    createDto: InvitationCreatableInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Required<Pick<InvitationInterface, 'id' | 'user'>>>;

  send(
    invitation: InvitationInterface,
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
