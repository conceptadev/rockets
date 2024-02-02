import { ActionEnum } from '../enums/action.enum';

export interface AccessControlGrantOptionInterface {
  resource: string;
  action: ActionEnum;
}
