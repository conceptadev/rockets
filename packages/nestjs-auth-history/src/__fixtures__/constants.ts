import { AuthLocalCredentialsInterface } from '@concepta/nestjs-auth-local';
import { randomUUID } from 'crypto';

export const USER_ID = randomUUID();
export const LOGIN_SUCCESS = {
  username: 'random_username',
  password: 'random_password',
};

export const LOGIN_FAIL = {
  username: 'wrong_username',
  password: 'wrong_password',
};

export const USER_SUCCESS: AuthLocalCredentialsInterface = {
  id: USER_ID,
  active: true,
  passwordHash: LOGIN_SUCCESS.password,
  passwordSalt: LOGIN_SUCCESS.password,
  username: LOGIN_SUCCESS.username,
};
