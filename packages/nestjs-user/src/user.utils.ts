import { PasswordStrengthEnum } from '@concepta/nestjs-password';
import { PasswordStrengthTransform } from './user.types';
import { PasswordStrengthTransformOptionsInterface } from '@concepta/nestjs-common';

export const defaultPasswordStrengthTransform: PasswordStrengthTransform = (
  options: PasswordStrengthTransformOptionsInterface,
): PasswordStrengthEnum | null => {
  const { roles } = options;

  if (roles.some((role) => role.role?.name === 'admin')) {
    return PasswordStrengthEnum.VeryStrong;
  }
  if (roles.some((role) => role.role?.name === 'user')) {
    return PasswordStrengthEnum.Strong;
  }

  return null;
};
