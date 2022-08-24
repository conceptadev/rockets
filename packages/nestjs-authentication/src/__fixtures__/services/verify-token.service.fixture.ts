import { JwtVerifyOptions } from '@nestjs/jwt';
import { VerifyTokenServiceInterface } from '../../interfaces/verify-token-service.interface';

export class VerifyTokenServiceFixture implements VerifyTokenServiceInterface {
  public discriminator = 'default';

  async accessToken(
    token: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    options?: JwtVerifyOptions | undefined, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<object> {
    throw new Error('Method not implemented.');
  }

  async refreshToken(
    token: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    options?: JwtVerifyOptions | undefined, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<object> {
    throw new Error('Method not implemented.');
  }
}
