import { Injectable } from '@nestjs/common';
import { OrgMutateService } from './org-mutate.service';

/**
 * Default org mutate service.
 */
@Injectable()
export class DefaultOrgMutateService extends OrgMutateService {}
