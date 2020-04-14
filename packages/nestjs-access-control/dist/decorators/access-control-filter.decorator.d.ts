import { AccessControlFilterOption } from '../interfaces/access-control-filter-option.interface';
/**
 * Define access filters required for this route.
 */
export declare const AccessControlFilter: (...acFilters: AccessControlFilterOption[]) => import("@nestjs/common").CustomDecorator<string>;
