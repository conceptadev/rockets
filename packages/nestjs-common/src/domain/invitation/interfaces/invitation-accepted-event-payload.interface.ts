import { ReferenceQueryOptionsInterface } from '../../../reference/interfaces/reference-query-options.interface';
import { LiteralObject } from '../../../utils/interfaces/literal-object.interface';
import { InvitationInterface } from './invitation.interface';

export interface InvitationAcceptedEventPayloadInterface {
  invitation: InvitationInterface;
  data?: LiteralObject;
  queryOptions?: ReferenceQueryOptionsInterface;
}
