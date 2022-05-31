import { OrgInterface } from './org.interface';

export interface OrgCreatableInterface
  extends Pick<OrgInterface, 'name' | 'active' | 'owner'> {}
