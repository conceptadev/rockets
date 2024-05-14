import { Exclude, Expose, Type } from 'class-transformer';
import { CacheInterface } from '@concepta/ts-common';
import { ApiProperty } from '@nestjs/swagger';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';
import { CacheDto } from './cache.dto';
/**
 * Org paginated DTO
 */
@Exclude()
export class CachePaginatedDto extends CrudResponsePaginatedDto<CacheInterface> {
  @Expose()
  @ApiProperty({
    type: CacheDto,
    isArray: true,
    description: 'Array of Caches',
  })
  @Type(() => CacheDto)
  data: CacheDto[] = [];
}
