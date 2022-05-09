import { OptionsInterface } from '@concepta/nestjs-common';
import { OrgLookupServiceInterface } from './org-lookup-service.interface';
import { OrgMutateServiceInterface } from './org-mutate-service.interface';
import { OrgSettingsInterface } from './org-settings.interface';

export interface OrgOptionsInterface extends OptionsInterface {
  settings?: OrgSettingsInterface;
  orgLookupService?: OrgLookupServiceInterface;
  orgMutateService?: OrgMutateServiceInterface;
}
