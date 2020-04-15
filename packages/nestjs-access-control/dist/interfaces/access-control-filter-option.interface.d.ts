import { AccessControlFilterService } from './access-control-filter-service.interface';
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
export declare type AccessControlFilterCallback = (data: unknown, user: unknown, acService?: AccessControlFilterService) => Promise<boolean>;
