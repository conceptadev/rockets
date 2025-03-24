import * as jwt from 'jsonwebtoken';
import { JwtSignOptions as NestJwtSignOptions } from '@nestjs/jwt';

export {
  JwtModule as NestJwtModule,
  JwtModuleOptions as NestJwtModuleOptions,
  JwtService as NestJwtService,
} from '@nestjs/jwt';

export { NestJwtSignOptions };

export type NestJwtSignStringOptions = Omit<
  NestJwtSignOptions,
  keyof jwt.SignOptions
>;
