import { JwtSignOptions } from '@nestjs/jwt';
import { AuthenticationResponseInterface } from '@concepta/ts-common';
import { IssueTokenServiceInterface } from '../../interfaces/issue-token-service.interface';

export class IssueTokenServiceFixture implements IssueTokenServiceInterface {
  public discriminator = 'default';

  responsePayload(
    id: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<AuthenticationResponseInterface> {
    throw new Error('Method not implemented.');
  }
  accessToken(
    payload: string | object | Buffer, // eslint-disable-line @typescript-eslint/no-unused-vars
    options?: JwtSignOptions | undefined, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
  refreshToken(
    payload: string | object | Buffer, // eslint-disable-line @typescript-eslint/no-unused-vars
    options?: JwtSignOptions | undefined, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
