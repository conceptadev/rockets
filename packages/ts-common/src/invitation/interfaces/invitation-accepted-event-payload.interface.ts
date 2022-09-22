import {
  LiteralObject,
  ReferenceQueryOptionsInterface,
} from '@concepta/ts-core';
import { InvitationInterface } from './invitation.interface';

export interface InvitationAcceptedEventPayloadInterface
  extends InvitationInterface {
  data?: LiteralObject;
  queryOptions?: ReferenceQueryOptionsInterface;
}
