import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuthHistoryInterface } from '@concepta/nestjs-common';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';
import { AuthHistoryDto } from './auth-history.dto';

/**
 * AuthHistory paginated DTO
 */
@Exclude()
export class AuthHistoryPaginatedDto extends CrudResponsePaginatedDto<AuthHistoryInterface> {
  @Expose()
  @ApiProperty({
    type: AuthHistoryDto,
    isArray: true,
    description: 'Array of AuthHistorys',
  })
  @Type(() => AuthHistoryDto)
  data: AuthHistoryDto[] = [];
}
