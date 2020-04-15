import {AccessControlFilterService} from './access-control-filter-service.interface';
import {AccessControlFilterType} from '../enums/access-control-filter-type.enum';

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

export type AccessControlFilterCallback = (
  data: AccessControlFilterMetaObj,
  user: AccessControlFilterMetaObj,
  acService?: AccessControlFilterService
) => Promise<boolean>;

export interface AccessControlFilterMeta {
  key: string;
  value: unknown;
}

export interface AccessControlFilterMetaObj {
  [key: string]: AccessControlFilterMeta;
}
