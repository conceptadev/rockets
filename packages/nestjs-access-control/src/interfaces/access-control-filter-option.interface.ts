import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  acService?: any
) => Promise<boolean>;
