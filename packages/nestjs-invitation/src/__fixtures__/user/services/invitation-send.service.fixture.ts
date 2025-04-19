import { Injectable } from '@nestjs/common';
import { InvitationUserInterface } from '@concepta/nestjs-common';
import { InvitationSendInviteInterface } from '../../../interfaces/domain/invitation-send-invite.interface';
import { InvitationSendInvitationEmailOptionsInterface } from '../../../interfaces/options/invitation-send-invitation-email-options.interface';
import { InvitationSendServiceInterface } from '../../../interfaces/services/invitation-send-service.interface';
import { InvitationCreateInviteInterface } from '../../../interfaces/domain/invitation-create-invite.interface';

@Injectable()
export class InvitationSendServiceFixture
  implements InvitationSendServiceInterface
{
  async create(
    _createDto: InvitationCreateInviteInterface,
  ): Promise<InvitationSendInviteInterface> {
    return {
      id: 'test-id',
      userId: 'test-user-id',
      category: 'foo',
      code: 'bar',
    };
  }

  async send(_invitation: InvitationSendInviteInterface): Promise<void> {}

  async getUser(
    _options: InvitationUserInterface,
  ): Promise<InvitationUserInterface> {
    return {} as InvitationUserInterface;
  }

  async sendInvitationEmail(
    _options: InvitationSendInvitationEmailOptionsInterface,
  ): Promise<void> {}
}
