import { InvitationGetUserEventResponseInterface } from '@concepta/nestjs-common';
import { InvitationInterface } from '@concepta/nestjs-common/src';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { Injectable } from '@nestjs/common';
import { InvitationCreateOneInterface } from '../../../interfaces/invitation-create-one.interface';
import { InvitationSendServiceInterface } from '../../../interfaces/invitation-send-service.interface';

@Injectable()
export class InvitationSendServiceFixture
  implements InvitationSendServiceInterface
{
  create(
    _createDto: InvitationCreateOneInterface,
    _queryOptions?: QueryOptionsInterface,
  ): Promise<Required<Pick<InvitationInterface, 'id' | 'user'>>> {
    return Promise.resolve({
      id: 'test-id',
      user: {
        id: 'test-user-id',
        email: 'test@email.com',
      },
    });
  }

  send(
    _invitation: Pick<
      InvitationInterface,
      'category' | 'user' | 'email' | 'code'
    >,
    _queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    return Promise.resolve();
  }
  getUser(
    _options: Pick<InvitationInterface, 'email'> &
      Partial<Pick<InvitationInterface, 'constraints'>>,
    _queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationGetUserEventResponseInterface> {
    return Promise.resolve({} as InvitationGetUserEventResponseInterface);
  }

  async sendEmail(
    _email: string,
    _code: string,
    _passcode: string,
    _resetTokenExp: Date,
  ): Promise<void> {}
}
