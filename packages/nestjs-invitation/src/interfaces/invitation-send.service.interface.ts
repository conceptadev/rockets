import {
  InvitationGetUserEventResponseInterface,
  LiteralObject,
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface InvitationSendServiceInterface {
  send(
    user: ReferenceIdInterface & ReferenceEmailInterface,
    code: string,
    category: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;

  getUser(
    email: string,
    payload?: LiteralObject,
    queryOptions?: QueryOptionsInterface,
  ): Promise<InvitationGetUserEventResponseInterface>;

  sendEmail(
    email: string,
    code: string,
    passcode: string,
    resetTokenExp: Date,
  ): Promise<void>;
}
