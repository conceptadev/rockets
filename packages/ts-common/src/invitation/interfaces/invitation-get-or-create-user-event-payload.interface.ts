import {
  LiteralObject,
  ReferenceQueryOptionsInterface,
} from '@concepta/ts-core';

export interface InvitationGetOrCreateUserEventPayloadInterface {
  email: string;
  data?: LiteralObject;
  queryOptions?: ReferenceQueryOptionsInterface;
}
