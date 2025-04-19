import { PasswordStorageInterface } from './interfaces/password-storage.interface';

export function isPasswordStorage(
  target: unknown,
): target is PasswordStorageInterface {
  return (
    typeof (target as PasswordStorageInterface).passwordHash === 'string' &&
    typeof (target as PasswordStorageInterface).passwordSalt === 'string'
  );
}
