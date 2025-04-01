import { Injectable } from '@nestjs/common';
import { AuthRefreshSettingsInterface } from '../../refresh/interfaces/auth-refresh-settings.interface';

@Injectable()
export class AuthRefreshServiceFixture {
  public discriminator: string = 'default';

  constructor(private readonly options?: AuthRefreshSettingsInterface) {}

  getOptions(): AuthRefreshSettingsInterface | undefined {
    return this.options;
  }
}
