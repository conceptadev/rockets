import { OrgInterface } from './org.interface';

export interface OrgUpdatableInterface
  extends Pick<OrgInterface, 'name' | 'ownerUserId'> {}
