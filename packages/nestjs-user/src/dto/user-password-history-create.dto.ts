import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { UserPasswordHistoryDto } from './user-password-history.dto';
import { UserPasswordHistoryCreatableInterface } from '@concepta/nestjs-common';

/**
 * User Password History Create DTO
 */
@Exclude()
export class UserPasswordHistoryCreateDto
  extends PickType(UserPasswordHistoryDto, [
    'passwordHash',
    'passwordSalt',
    'userId',
  ] as const)
  implements UserPasswordHistoryCreatableInterface {}
