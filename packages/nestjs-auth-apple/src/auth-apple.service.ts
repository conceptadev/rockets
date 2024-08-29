import { NestJwtService } from '@concepta/nestjs-jwt/dist/jwt.externals';
import { Inject, Injectable } from '@nestjs/common';
import { JwksClient } from 'jwks-rsa';
import {
  AUTH_APPLE_JWT_KEYS,
  AUTH_APPLE_JWT_SERVICE_TOKEN,
  AUTH_APPLE_MODULE_SETTINGS_TOKEN,
  AUTH_APPLE_TOKEN_ISSUER,
  AUTH_APPLE_VERIFY_ALGORITHM_RS256,
} from './auth-apple.constants';
import { AuthAppleSettingsInterface } from './interfaces/auth-apple-settings.interface';
import { AuthAppleProfileInterface } from './interfaces/auth-apple-profile.interface';
import { AuthAppleServiceInterface } from './interfaces/auth-apple-service.interface';
import { AuthAppleInvalidIssuerException } from './exceptions/auth-apple-invalid-issuer.exception';
import { AuthAppleInvalidAudienceException } from './exceptions/auth-apple-invalid-audience.exception';
import { AuthAppleTokenExpiredException } from './exceptions/auth-apple-token-expired.exception';
import { AuthAppleEmailNotVerifiedException } from './exceptions/auth-apple-email-not-verified.exception';
import { AuthAppleDecodeException } from './exceptions/auth-apple-decode.exception';
import { AuthApplePublicKeyException } from './exceptions/auth-apple-public-key.exception';

@Injectable()
export class AuthAppleService implements AuthAppleServiceInterface {
  constructor(
    @Inject(AUTH_APPLE_MODULE_SETTINGS_TOKEN)
    private settings: AuthAppleSettingsInterface,
    @Inject(AUTH_APPLE_JWT_SERVICE_TOKEN)
    private jwtService: NestJwtService,
  ) {}

  // Function to verify JWT token
  public async verifyIdToken(
    idToken: string,
  ): Promise<AuthAppleProfileInterface> {

    // Extract key ID from token header
    const kid = this.extractKeyId(idToken);

    // Fetch public key
    const publicKey = await this.fetchPublicKey(kid);

    // Verify and return decoded token
    return this.verifyToken(idToken, publicKey);
  }

  private extractKeyId(idToken: string): string {
    try {
      const decodedHeader = this.jwtService.decode(idToken, { complete: true });
      return decodedHeader.header.kid;
    } catch (e) {
      throw new AuthAppleDecodeException();
    }
  }

  private async fetchPublicKey(kid: string): Promise<string> {
    try {
      const client = new JwksClient({ jwksUri: AUTH_APPLE_JWT_KEYS });
      const key = await client.getSigningKey(kid);
      return key.getPublicKey();
    } catch (e) {
      throw new AuthApplePublicKeyException();
    }
  }

  private verifyToken(
    idToken: string,
    publicKey: string,
  ): Promise<AuthAppleProfileInterface> {
    return this.jwtService.verifyAsync(idToken, {
      publicKey,
      algorithms: [AUTH_APPLE_VERIFY_ALGORITHM_RS256],
    });
  }

  // Function to validate claims like issuer, audience, and expiration
  public validateClaims(tokenPayload: AuthAppleProfileInterface) {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    if (tokenPayload.iss !== AUTH_APPLE_TOKEN_ISSUER) {
      throw new AuthAppleInvalidIssuerException();
    }

    if (tokenPayload.aud !== this.settings.clientID) {
      throw new AuthAppleInvalidAudienceException();
    }

    if (currentTime >= tokenPayload.exp) {
      throw new AuthAppleTokenExpiredException();
    }

    if (!tokenPayload.email_verified) {
      throw new AuthAppleEmailNotVerifiedException();
    }
  }
}
