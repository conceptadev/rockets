import { PasswordStrengthEnum } from '@concepta/nestjs-password';
import { PasswordStrengthTransform } from './user.types';
import {
  PasswordStrengthTransformOptionsInterface,
  RoleOwnableInterface,
} from '@concepta/nestjs-common';

export const defaultPasswordStrengthTransform: PasswordStrengthTransform = (
  options?: PasswordStrengthTransformOptionsInterface,
): PasswordStrengthEnum | undefined => {
  if (options) {
    const { roles } = options;

    if (roles) {
      if (
        roles.some((role: RoleOwnableInterface) => role.role?.name === 'admin')
      ) {
        return PasswordStrengthEnum.VeryStrong;
      }
      if (
        roles.some((role: RoleOwnableInterface) => role.role?.name === 'user')
      ) {
        return PasswordStrengthEnum.Strong;
      }
    }
  }

  return undefined;
};
