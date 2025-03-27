import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { UserProfileCreatableInterface } from '@concepta/nestjs-common';
import { UserProfileDto } from './user-profile.dto';

/**
 * User Profile Create DTO
 */
@Exclude()
export class UserProfileCreateDto
  extends PickType(UserProfileDto, ['userId'] as const)
  implements UserProfileCreatableInterface {}
