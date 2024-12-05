import { ReferenceQueryOptionsInterface } from '../../../reference/interfaces/reference-query-options.interface';
import { LiteralObject } from '../../../utils/interfaces/literal-object.interface';

export interface InvitationGetUserEventPayloadInterface {
  email: string;
  data?: LiteralObject;
  queryOptions?: ReferenceQueryOptionsInterface;
}
