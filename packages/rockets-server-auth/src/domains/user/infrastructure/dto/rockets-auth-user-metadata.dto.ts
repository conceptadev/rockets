import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base metadata DTO. App-specific fields belong on a subclass.
 */
@Exclude()
export class RocketsAuthUserMetadataDto {
  @ApiProperty({ description: 'Metadata ID' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'User ID' })
  @Expose()
  userId!: string;

  @ApiProperty({ description: 'Date created' })
  @Expose()
  dateCreated!: Date;

  @ApiProperty({ description: 'Date updated' })
  @Expose()
  dateUpdated!: Date;

  @ApiPropertyOptional({ description: 'Date deleted' })
  @Expose()
  dateDeleted?: Date | null;

  @ApiProperty({ description: 'Version' })
  @Expose()
  version!: number;
}
