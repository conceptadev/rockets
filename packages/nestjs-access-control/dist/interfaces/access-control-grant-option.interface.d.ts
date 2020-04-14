import { AccessControlAction } from '../enums/access-control-action.enum';
export interface AccessControlGrantOption {
    resource: AccessControlGrantResource;
    action: AccessControlAction;
}
export declare type AccessControlGrantResource = string;
