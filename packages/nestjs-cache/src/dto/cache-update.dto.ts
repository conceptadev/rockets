import { CacheUpdatableInterface } from '@concepta/ts-common';
import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CacheDto } from './cache.dto';
/**
 * Cache Create DTO
 */
@Exclude()
export class CacheUpdateDto
  extends PickType(CacheDto, ['key', 'type', 'assignee', 'data'] as const)
  implements CacheUpdatableInterface {}
