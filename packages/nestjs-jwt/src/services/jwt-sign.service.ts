import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtSignServiceInterface } from '../interfaces/jwt-sign-service.interface';
import { JWT_MODULE_JWT_SERVICE_TOKEN } from '../jwt.constants';

@Injectable()
export class JwtSignService implements JwtSignServiceInterface {
  constructor(
    @Inject(JWT_MODULE_JWT_SERVICE_TOKEN) private nestJwtService: JwtService,
  ) {}

  sign(
    ...args: Parameters<JwtService['sign']>
  ): ReturnType<JwtService['sign']> {
    return this.nestJwtService.sign(...args);
  }

  async signAsync(
    ...args: Parameters<JwtService['signAsync']>
  ): ReturnType<JwtService['signAsync']> {
    return this.nestJwtService.signAsync(...args);
  }

  verify<T extends object = Record<string, unknown>>(
    ...args: Parameters<JwtService['verify']>
  ): T {
    return this.nestJwtService.verify(...args);
  }

  async verifyAsync<T extends object = Record<string, unknown>>(
    ...args: Parameters<JwtService['verifyAsync']>
  ): Promise<T> {
    return this.nestJwtService.verifyAsync(...args);
  }

  decode(
    ...args: Parameters<JwtService['decode']>
  ): ReturnType<JwtService['decode']> {
    return this.nestJwtService.decode(...args);
  }
}
