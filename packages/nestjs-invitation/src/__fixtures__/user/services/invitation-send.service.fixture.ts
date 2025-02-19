import {
  InvitationGetUserEventResponseInterface,
  LiteralObject,
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { Injectable } from '@nestjs/common';
import { InvitationSendServiceInterface } from '../../../interfaces/invitation-send.service.interface';

@Injectable()
export class InvitationSendServiceFixture
  implements InvitationSendServiceInterface
{
  send(
    _user: ReferenceIdInterface & ReferenceEmailInterface,
    _code: string,
    _category: string,
    _queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    return Promise.resolve();
  }
  getUser(
    _email: string,
    _payload?: LiteralObject,
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
