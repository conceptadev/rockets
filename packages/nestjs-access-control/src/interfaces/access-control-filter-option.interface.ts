import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';
import { AccessControlFilterService } from './access-control-filter-service.interface';

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

export type AccessControlFilterCallback<
  D = unknown,
  U = unknown,
  S = unknown
> = (
  data: D,
  user?: U,
  acService?: S & AccessControlFilterService
) => Promise<boolean>;
