import { OrgInterface } from './org.interface';

export interface OrgCreatableInterface
  extends Pick<OrgInterface, 'name' | 'owner'>,
    Partial<Pick<OrgInterface, 'active'>> {}
