import { Injectable } from '@nestjs/common';
import { AuthLocalUserLookupService } from './auth-local-user-lookup.service';

@Injectable()
export class DefaultAuthLocalUserLookupService extends AuthLocalUserLookupService {}
