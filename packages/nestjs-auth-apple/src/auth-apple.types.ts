import { AuthAppleCredentialsInterface } from './interfaces/auth-apple-credentials.interface';

export type MapProfile = (idToken: string) => AuthAppleCredentialsInterface;
