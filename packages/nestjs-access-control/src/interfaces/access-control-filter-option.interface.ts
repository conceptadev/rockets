import {AccessControlFilterService} from './access-control-filter-service.interface';
import {AccessControlFilterType} from '../enums/access-control-filter-type.enum';
import {AccessControlUserRecord} from './access-control-user-record.interface';

export interface AccessControlFilterOption {
  /**
   * Which request data to check.
   */
  type: AccessControlFilterType;

  /**
   * Callback function used for advanced validation
   */
  filter: AccessControlFilterCallback;
}

export type AccessControlFilterCallback = <U extends AccessControlUserRecord, S extends AccessControlFilterService, D = unknown>(
  data: D,
  user: U,
  acService?: S
) => Promise<boolean>;
