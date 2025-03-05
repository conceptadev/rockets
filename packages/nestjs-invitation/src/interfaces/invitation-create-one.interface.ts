import { InvitationCreatableInterface } from './invitation-creatable.interface';

export interface InvitationCreateOneInterface
  extends Pick<
    InvitationCreatableInterface,
    'email' | 'category' | 'constraints'
  > {}
