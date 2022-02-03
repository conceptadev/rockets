import { Injectable } from '@nestjs/common';
import { JwtVerifyService } from './jwt-verify.service';

@Injectable()
export class DefaultJwtVerifyService extends JwtVerifyService {}
