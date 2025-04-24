import { Injectable } from '@nestjs/common';
import {
  InvitationInterface,
  InvitationUserInterface,
} from '@concepta/nestjs-common';
import { InvitationCreateInviteInterface } from '../../../interfaces/domain/invitation-create-invite.interface';
import { InvitationSendServiceInterface } from '../../../interfaces/services/invitation-send-service.interface';
import { InvitationSendInvitationEmailOptionsInterface } from '../../../interfaces/options/invitation-send-invitation-email-options.interface';
import { InvitationSendInviteInterface } from '../../../interfaces/domain/invitation-send-invite.interface';

@Injectable()
export class InvitationSendServiceFixture
  implements InvitationSendServiceInterface
{
  create(
    _createInviteDto: InvitationCreateInviteInterface,
  ): Promise<InvitationSendInviteInterface> {
    return Promise.resolve({
      id: 'test-id',
      category: 'foo',
      code: 'bar',
      userId: 'test-user-id',
    });
  }

  send(_invitation: InvitationSendInviteInterface): Promise<void> {
    return Promise.resolve();
  }

  getUser(
    _options: Pick<InvitationCreateInviteInterface, 'email'> &
      Partial<Pick<InvitationInterface, 'constraints'>>,
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
