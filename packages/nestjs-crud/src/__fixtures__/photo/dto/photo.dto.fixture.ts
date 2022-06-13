import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceId } from '@concepta/ts-core';
import { CrudResponseDto } from '../../../dto/crud-response.dto';
import { PhotoEntityInterfaceFixture } from '../interfaces/photo-entity.interface.fixture';

@Exclude()
export class PhotoDtoFixture
  extends CrudResponseDto<PhotoEntityInterfaceFixture>
  implements PhotoEntityInterfaceFixture
{
  @ApiProperty()
  @Expose()
  @IsUUID()
  id: ReferenceId = '';

  @ApiProperty()
  @Expose()
  @IsString()
  name = '';

  @ApiProperty()
  @Expose()
  @IsString()
  description = '';

  @ApiProperty()
  @Expose()
  @IsString()
  filename = '';

  @ApiProperty()
  @Expose()
  @IsNumber()
  views = 0;

  @ApiProperty()
  @Expose()
  @IsBoolean()
  isPublished = true;

  @ApiProperty()
  @Expose()
  deletedAt: Date | null = null;
}
