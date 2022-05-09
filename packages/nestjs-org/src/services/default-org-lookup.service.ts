import { Injectable } from '@nestjs/common';
import { OrgLookupService } from './org-lookup.service';

/**
 * Default user lookup service.
 */
@Injectable()
export class DefaultOrgLookupService extends OrgLookupService {}
