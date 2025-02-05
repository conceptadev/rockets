import { PasswordStrengthEnum } from '@concepta/nestjs-password';
import { PasswordStrengthTransform } from './user.types';
import { PasswordStrengthTransformOptionsInterface } from '@concepta/nestjs-common';

export const defaultPasswordStrengthTransform: PasswordStrengthTransform = (
  options: PasswordStrengthTransformOptionsInterface,
): PasswordStrengthEnum | null => {
  const { roles } = options;
  // Default implementation - require medium strength for all roles
  if (roles.includes('admin')) {
    return PasswordStrengthEnum.VeryStrong;
  }
  if (roles.includes('user')) {
    return PasswordStrengthEnum.Strong;
  }

  return null;
};
