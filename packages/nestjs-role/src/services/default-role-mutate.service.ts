import { Injectable } from '@nestjs/common';
import { RoleMutateService } from './role-mutate.service';

/**
 * Default role mutate service.
 */
@Injectable()
export class DefaultRoleMutateService extends RoleMutateService {}
