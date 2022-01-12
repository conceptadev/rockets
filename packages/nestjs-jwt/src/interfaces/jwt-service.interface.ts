import { JwtService } from '@nestjs/jwt';

export interface JwtServiceInterface
  extends Pick<
    JwtService,
    'sign' | 'signAsync' | 'verify' | 'verifyAsync' | 'decode'
  > {}
