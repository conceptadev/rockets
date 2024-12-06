import { ReferenceEmailInterface } from '../../../reference/interfaces/reference-email.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';

export interface InvitationGetUserEventResponseInterface
  extends ReferenceIdInterface,
    ReferenceEmailInterface {}
