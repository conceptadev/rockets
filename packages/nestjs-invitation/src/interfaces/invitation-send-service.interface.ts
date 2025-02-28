import { InvitationInterface } from '@concepta/nestjs-common';
import { InvitationGetUserEventResponseInterface } from '@concepta/nestjs-common/src';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { InvitationCreatableInterface } from './invitation-creatable.interface';

export interface InvitationSendServiceInterface {
  create(
    createDto: InvitationCreatableInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Required<Pick<InvitationInterface, 'id' | 'user'>>>;
  send(
    invitation: Pick<
      InvitationInterface,
      'category' | 'user' | 'email' | 'code'
    >,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;
  getUser(
    options: Pick<InvitationInterface, 'email'> &
      Partial<Pick<InvitationInterface, 'constraints'>>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationGetUserEventResponseInterface>;
}
