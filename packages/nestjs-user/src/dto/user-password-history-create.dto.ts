import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { UserPasswordHistoryDto } from './user-password-history.dto';
import { UserPasswordHistoryCreatableInterface } from '../interfaces/user-password-history-creatable.interface';

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
