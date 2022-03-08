import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { CrudResponseDto } from '../../../src/dto/crud-response.dto';
import { PhotoEntityInterface } from '../interfaces/photo-entity.interface';

@Exclude()
export class PhotoDto
  extends CrudResponseDto<PhotoEntityInterface>
  implements PhotoEntityInterface
{
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsString()
  filename: string;

  @Expose()
  @IsNumber()
  views: number;

  @Expose()
  @IsBoolean()
  isPublished: boolean;

  @Expose()
  deletedAt: Date | null = null;
}
