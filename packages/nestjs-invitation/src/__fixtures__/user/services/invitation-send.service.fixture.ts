import { Injectable } from '@nestjs/common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
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
    _queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationSendInviteInterface> {
    return {
      id: 'test-id',
      user: {
        id: 'test-user-id',
        email: 'test@email.com',
      },
      category: 'foo',
      code: 'bar',
    };
  }

  async send(
    _invitation: InvitationSendInviteInterface,
    _queryOptions?: QueryOptionsInterface,
  ): Promise<void> {}

  async getUser(
    _options: InvitationUserInterface,
    _queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationUserInterface> {
    return {} as InvitationUserInterface;
  }

  async sendInvitationEmail(
    _options: InvitationSendInvitationEmailOptionsInterface,
  ): Promise<void> {}
}
