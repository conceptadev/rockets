import { OrgModelServiceInterface } from './org-model-service.interface';
import { OrgSettingsInterface } from './org-settings.interface';

export interface OrgOptionsInterface {
  settings?: OrgSettingsInterface;
  orgModelService?: OrgModelServiceInterface;
}
