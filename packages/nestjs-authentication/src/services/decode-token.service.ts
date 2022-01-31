import { Injectable } from '@nestjs/common';
import { JwtSignService } from '@rockts-org/nestjs-jwt';
import { DecodeTokenServiceInterface } from '../interfaces/decode-token-service.interface';

@Injectable()
export class DecodeTokenService implements DecodeTokenServiceInterface {
  constructor(private jwtSignService: JwtSignService) {}

  /**
   * Generate access token for a payload.
   *
   * @param id user id or name for `sub` claim
   */
  async verifyToken(token: string): Promise<string> {
    // TODO: need to review this
    const payload = await this.jwtSignService.verifyAsync(token);

    if (payload) return 'THERE IS NO SECRET';
    else return '';
  }
}
