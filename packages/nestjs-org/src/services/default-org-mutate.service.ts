import { Injectable } from '@nestjs/common';
import { OrgMutateService } from './org-mutate.service';

/**
 * Default user mutate service.
 */
@Injectable()
export class DefaultOrgMutateService extends OrgMutateService {}
