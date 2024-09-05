import { NestJwtService } from '../jwt.externals';

export interface JwtVerifyServiceInterface {
  verifyAsync: <T extends object = object>(
    ...rest: Parameters<NestJwtService['verifyAsync']>
  ) => Promise<T>;

  decode: <T = unknown>(...rest: Parameters<NestJwtService['decode']>) => T;
}
