import { IsBoolean, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { CrudResponseDto } from '../../../dto/crud-response.dto';
import { PhotoEntityInterface } from '../interfaces/photo-entity.interface';

@Exclude()
export class PhotoDto
  extends CrudResponseDto<PhotoEntityInterface>
  implements PhotoEntityInterface
{
  @ApiProperty()
  @Expose()
  @IsUUID()
  id: string;

  @ApiProperty()
  @Expose()
  @IsString()
  name: string;

  @ApiProperty()
  @Expose()
  @IsString()
  description: string;

  @ApiProperty()
  @Expose()
  @IsString()
  filename: string;

  @ApiProperty()
  @Expose()
  @IsNumber()
  views: number;

  @ApiProperty()
  @Expose()
  @IsBoolean()
  isPublished: boolean;

  @ApiProperty()
  @Expose()
  deletedAt: Date | null = null;
}
