import { OrgInterface } from './org.interface';

export interface OrgUpdatableInterface
  extends Pick<OrgInterface, 'id' | 'name' | 'active'>,
    Partial<Pick<OrgInterface, 'ownerId'>> {}
