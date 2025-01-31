import { PasswordStrengthEnum } from '@concepta/nestjs-password';

export enum UserResource {
  'One' = 'user',
  'Many' = 'user-list',
}

export type PasswordStrengthByRoleCallback = (
  userRoles: string[],
) => PasswordStrengthEnum | null;
