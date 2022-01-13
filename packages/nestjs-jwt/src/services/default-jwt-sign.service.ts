import { Injectable } from '@nestjs/common';
import { JwtSignService } from './jwt-sign.service';

@Injectable()
export class DefaultJwtSignService extends JwtSignService {}
