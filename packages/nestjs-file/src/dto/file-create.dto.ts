import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { FileCreatableInterface } from '@concepta/ts-common';
import { FileDto } from './file.dto';

/**
 * File Create DTO
 */
@Exclude()
export class FileCreateDto
  extends PickType(FileDto, ['serviceKey', 'fileName', 'contentType'] as const)
  implements FileCreatableInterface {}
