import { Injectable } from '@nestjs/common';
import { OrgLookupService } from './org-lookup.service';

/**
 * Default org lookup service.
 */
@Injectable()
export class DefaultOrgLookupService extends OrgLookupService {}
