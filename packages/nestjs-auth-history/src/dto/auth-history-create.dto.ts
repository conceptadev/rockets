import { Exclude } from 'class-transformer';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { AuthHistoryCreatableInterface } from '@concepta/nestjs-common';
import { AuthHistoryDto } from './auth-history.dto';

/**
 * AuthHistory Create DTO
 */
@Exclude()
export class AuthHistoryCreateDto
  extends IntersectionType(
    PickType(AuthHistoryDto, [
      'userId',
      'authType',
      'ipAddress',
      'deviceInfo',
      'success',
    ] as const),
    PickType(AuthHistoryDto, ['deviceInfo'] as const),
  )
  implements AuthHistoryCreatableInterface {}
