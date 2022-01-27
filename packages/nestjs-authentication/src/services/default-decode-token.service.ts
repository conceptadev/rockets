import { Injectable } from '@nestjs/common';
import { DecodeTokenService } from './decode-token.service';

@Injectable()
export class DefaultDecodeTokenService extends DecodeTokenService {}
