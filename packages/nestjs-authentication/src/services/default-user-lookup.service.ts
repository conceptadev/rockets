import { Injectable } from '@nestjs/common';
import { UserLookupService } from './user-lookup.service';

@Injectable()
export class DefaultUserLookupService extends UserLookupService {}
