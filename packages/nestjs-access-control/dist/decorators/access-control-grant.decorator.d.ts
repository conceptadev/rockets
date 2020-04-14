import { AccessControlGrantOption } from '../interfaces/access-control-grant-option.interface';
/**
 * Define access control filters required for this route.
 */
export declare const AccessControlGrant: (...acFilters: AccessControlGrantOption[]) => import("@nestjs/common").CustomDecorator<string>;
