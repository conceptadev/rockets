import { Injectable } from '@nestjs/common';
import { UserLookupService } from './user-lookup.service';

/**
 * Default user service.
 */
@Injectable()
export class DefaultUserLookupService extends UserLookupService {}
