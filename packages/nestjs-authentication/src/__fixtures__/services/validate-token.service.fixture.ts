import { ValidateTokenServiceInterface } from '../../interfaces/validate-token-service.interface';

export class ValidateTokenServiceFixture
  implements ValidateTokenServiceInterface
{
  public discriminator = 'default';

  async validateToken(
    payload: Record<string, unknown>, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
