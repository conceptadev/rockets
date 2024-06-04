import { CacheCreatableInterface } from '@concepta/ts-common';
import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CacheDto } from './cache.dto';
/**
 * Cache Create DTO
 */
@Exclude()
export class CacheCreateDto
  extends PickType(CacheDto, [
    'key',
    'data',
    'type',
    'expiresIn',
    'assignee',
  ] as const)
  implements CacheCreatableInterface
{}
