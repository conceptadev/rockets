import { Injectable } from '@nestjs/common';
import { RoleLookupService } from './role-lookup.service';

/**
 * Default role lookup service.
 */
@Injectable()
export class DefaultRoleLookupService extends RoleLookupService {}
