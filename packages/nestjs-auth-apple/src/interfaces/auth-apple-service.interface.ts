import { AuthAppleCredentialsInterface } from './auth-apple-credentials.interface';

export interface AuthAppleServiceInterface {
  /**
   * Maps the Apple ID token to Apple credentials.
   *
   * @param idToken - A JWT returned from Apple OAuth.
   * @returns A promise that resolves to the mapped Apple credentials.
   */
  mapProfile(idToken: string): Promise<AuthAppleCredentialsInterface>;
}
