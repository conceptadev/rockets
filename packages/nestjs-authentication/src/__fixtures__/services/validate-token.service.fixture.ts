import { ValidateTokenServiceInterface } from '../../interfaces/validate-token-service.interface';

export class ValidateTokenServiceFixture
  implements ValidateTokenServiceInterface
{
  public discriminator = 'default';

  async validateToken(_payload: Record<string, unknown>): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
