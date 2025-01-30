import { PasswordStrengthEnum } from '@concepta/nestjs-password';
import { PasswordStrengthByRoleCallback } from './user.types';

export const defaultPasswordStrengthByRole: PasswordStrengthByRoleCallback = (
  roles: string[],
): PasswordStrengthEnum | null => {
  // Default implementation - require medium strength for all roles
  if (roles.includes('admin')) {
    return PasswordStrengthEnum.VeryStrong;
  }
  if (roles.includes('user')) {
    return PasswordStrengthEnum.Strong;
  }

  return null;
};
