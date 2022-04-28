import { Injectable } from '@nestjs/common';
import { UserMutateService } from './user-mutate.service';

/**
 * Default user mutate service.
 */
@Injectable()
export class DefaultUserMutateService extends UserMutateService {}
