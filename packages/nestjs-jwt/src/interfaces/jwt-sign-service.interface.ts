import { JwtService as NestJwtService } from '@nestjs/jwt';

export interface JwtSignServiceInterface
  extends Pick<
    NestJwtService,
    'sign' | 'signAsync' | 'verify' | 'verifyAsync' | 'decode'
  > {}
