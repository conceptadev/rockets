import { Injectable } from '@nestjs/common';
import {
  InvitationInterface,
  InvitationUserInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { InvitationCreateInviteInterface } from '../../../interfaces/invitation-create-invite.interface';
import { InvitationSendServiceInterface } from '../../../interfaces/invitation-send-service.interface';
import { InvitationSendInvitationEmailOptionsInterface } from '../../../interfaces/invitation-send-invitation-email-options.interface';
import { InvitationSendInviteInterface } from '../../../interfaces/invitation-send-invite.interface';

@Injectable()
export class InvitationSendServiceFixture
  implements InvitationSendServiceInterface
{
  create(
    _createInviteDto: InvitationCreateInviteInterface,
    _queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationSendInviteInterface> {
    return Promise.resolve({
      id: 'test-id',
      category: 'foo',
      code: 'bar',
      user: {
        id: 'test-user-id',
        email: 'test@email.com',
      },
    });
  }

  send(
    _invitation: InvitationSendInviteInterface,
    _queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    return Promise.resolve();
  }

  getUser(
    _options: Pick<InvitationCreateInviteInterface, 'email'> &
      Partial<Pick<InvitationInterface, 'constraints'>>,
    _queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationUserInterface> {
    return Promise.resolve({
      id: '',
      email: '',
      username: '',
    });
  }

  async sendInvitationEmail(
    _options: InvitationSendInvitationEmailOptionsInterface,
  ): Promise<void> {}
}
