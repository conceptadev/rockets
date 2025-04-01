import { Injectable } from '@nestjs/common';
import { AuthJwtSettingsInterface } from '../../auth-jwt/interfaces/auth-jwt-settings.interface';

@Injectable()
export class AuthJwtServiceFixture {
  public discriminator: string = 'default';
  
  constructor(private readonly options?: AuthJwtSettingsInterface) {}
  
  getOptions(): AuthJwtSettingsInterface | undefined {
    return this.options;
  }
} 