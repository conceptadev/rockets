import {AccessControlAction} from '../enums/access-control-action.enum';

export interface AccessControlGrantOption {
  resource: AccessControlGrantResource;
  action: AccessControlAction;
}

export type AccessControlGrantResource = string;
