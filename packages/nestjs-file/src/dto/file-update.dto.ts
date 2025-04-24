import { Exclude } from 'class-transformer';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { FileUpdatableInterface } from '@concepta/nestjs-common';
import { FileDto } from './file.dto';
import { FileCreateDto } from './file-create.dto';

/**
 * File Update DTO
 */
@Exclude()
export class FileUpdateDto
  extends IntersectionType(PickType(FileDto, ['id'] as const), FileCreateDto)
  implements FileUpdatableInterface {}
