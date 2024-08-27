import { AuthAppleProfileInterface } from '../interfaces/auth-apple-profile.interface';
import { AuthAppleCredentialsInterface as AuthAppleCredentialsInterface } from '../interfaces/auth-apple-credentials.interface';
// TODO: add it to index export
import { NestJwtService } from '@concepta/nestjs-jwt/dist/jwt.externals';
import { AuthAppleDecodeException } from '../exceptions/auth-apple-decode.exception';

export const mapProfile = (idToken: string): AuthAppleCredentialsInterface => {
  const profile = getProfile(idToken);

  const result: AuthAppleCredentialsInterface = {
    id: profile?.sub ?? '',
    email: profile.email ?? '',
  };

  return result;
};

/**
 * Extracts the profile information from an Apple ID token.
 *
 * @param  idToken - The Apple ID token to decode.
 * @returns The extracted profile information.
 */
const getProfile = (idToken: string): AuthAppleProfileInterface => {
  const jwt = new NestJwtService();
  try {
    // TODO: should we verify JWT token ?
    const tokenDecoded = jwt.decode(idToken, { complete: true });
    return tokenDecoded?.payload as AuthAppleProfileInterface;
  } catch (err) {
    throw new AuthAppleDecodeException();
  }
};
