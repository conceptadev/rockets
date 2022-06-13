import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CrudResponsePaginatedInterface } from '../interfaces/crud-response-paginated.interface';
import { CrudResponseDto } from './crud-response.dto';

@Exclude()
export class CrudResponsePaginatedDto<T extends ReferenceIdInterface>
  implements CrudResponsePaginatedInterface<T>
{
  @Expose()
  @ApiProperty({
    type: CrudResponseDto,
    description: 'The list of records for current page',
  })
  @Type(() => CrudResponseDto)
  data: T[] = [];

  @Expose()
  @ApiProperty({ type: 'number', description: 'Count of all records' })
  count = 0;

  @Expose()
  @ApiProperty({
    type: 'number',
    description: 'Count of records on current page',
  })
  total = 0;

  @Expose()
  @ApiProperty({ type: 'number', description: 'Current page number' })
  page = 0;

  @Expose()
  @ApiProperty({ type: 'number', description: 'Total number of pages' })
  pageCount = 0;
}
