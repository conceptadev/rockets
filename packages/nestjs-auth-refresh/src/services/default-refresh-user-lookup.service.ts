import { Injectable } from '@nestjs/common';
import { RefreshUserLookupService } from './refresh-user-lookup.service';

@Injectable()
export class DefaultRefreshUserLookupService extends RefreshUserLookupService {}
