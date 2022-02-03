import { Injectable } from '@nestjs/common';
import { VerifyTokenService } from './verify-token.service';

@Injectable()
export class DefaultVerifyTokenService extends VerifyTokenService {}
