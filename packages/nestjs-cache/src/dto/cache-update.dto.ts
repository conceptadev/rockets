import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { CacheUpdatableInterface } from '@concepta/nestjs-common';
import { CacheDto } from './cache.dto';

/**
 * Cache Create DTO
 */
@Exclude()
export class CacheUpdateDto
  extends PickType(CacheDto, [
    'key',
    'type',
    'assigneeId',
    'data',
    'expiresIn',
  ] as const)
  implements CacheUpdatableInterface {}
