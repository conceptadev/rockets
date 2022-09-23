import {
  LiteralObject,
  ReferenceQueryOptionsInterface,
} from '@concepta/ts-core';

export interface InvitationGetUserEventPayloadInterface {
  email: string;
  data?: LiteralObject;
  queryOptions?: ReferenceQueryOptionsInterface;
}
