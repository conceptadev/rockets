import { Injectable } from '@nestjs/common';
import { RefreshTokenServiceInterface } from '../interfaces/refresh-token-service.interface';
import { JwtSignService } from '@rockts-org/nestjs-jwt';

@Injectable()
export class RefreshTokenServiceService implements RefreshTokenServiceInterface {
  constructor(private jwtSignService: JwtSignService) {}
 
  /**
   * 
   *
   * @param refreshToken refresh token
   */
  async refreshToken(refreshToken: string): Promise<string> {

    // check if refresh token is valid and get payload
    const payload = await this.jwtSignService.verifyAsync(refreshToken);
    
    // generate a new access token
    return this.jwtSignService.signAsync(payload);
  }
 
}
