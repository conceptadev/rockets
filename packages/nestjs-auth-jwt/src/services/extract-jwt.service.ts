import { Injectable } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class ExtractJwtService {
  extractJwtPayload() {
    return ExtractJwt.fromAuthHeaderAsBearerToken();
  }
}
