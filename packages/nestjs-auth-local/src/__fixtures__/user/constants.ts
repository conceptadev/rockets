import { randomUUID } from 'crypto';
import { AuthLocalCredentialsInterface } from '../../interfaces/auth-local-credentials.interface';

export const LOGIN_SUCCESS = {
  username: 'random_username',
  password: 'random_password',
};

export const USER_SUCCESS: AuthLocalCredentialsInterface = {
  id: randomUUID(),
  passwordHash: LOGIN_SUCCESS.password,
  passwordSalt: LOGIN_SUCCESS.password,
  username: LOGIN_SUCCESS.username,
};