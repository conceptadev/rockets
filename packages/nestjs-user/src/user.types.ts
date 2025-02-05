import { PasswordStrengthTransformOptionsInterface } from '@concepta/nestjs-common';
import { PasswordStrengthEnum } from '@concepta/nestjs-password';

export enum UserResource {
  'One' = 'user',
  'Many' = 'user-list',
}

export type PasswordStrengthTransform = (
  options: PasswordStrengthTransformOptionsInterface,
) => PasswordStrengthEnum | null;
