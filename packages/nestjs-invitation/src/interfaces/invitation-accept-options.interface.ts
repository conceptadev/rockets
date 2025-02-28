import { LiteralObject } from '@concepta/nestjs-common';
import { InvitationInterface } from '@concepta/nestjs-common/src';

export interface InvitationAcceptOptionsInterface {
  invitation: InvitationInterface;
  passcode: string;
  constraints?: LiteralObject;
}
