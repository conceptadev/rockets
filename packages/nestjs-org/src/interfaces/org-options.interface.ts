import { OrgLookupServiceInterface } from './org-lookup-service.interface';
import { OrgMutateServiceInterface } from './org-mutate-service.interface';
import { OrgOwnerLookupServiceInterface } from './org-owner-lookup-service.interface';
import { OrgSettingsInterface } from './org-settings.interface';

export interface OrgOptionsInterface {
  settings?: OrgSettingsInterface;
  orgLookupService?: OrgLookupServiceInterface;
  orgMutateService?: OrgMutateServiceInterface;
  ownerLookupService: OrgOwnerLookupServiceInterface;
}
