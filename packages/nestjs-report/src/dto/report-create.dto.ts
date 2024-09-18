import { ReportCreatableInterface } from '@concepta/ts-common';
import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ReportDto } from './report.dto';

/**
 * Report Create DTO
 */
@Exclude()
export class ReportCreateDto
  extends PickType(ReportDto, ['serviceKey', 'name', 'status'] as const)
  implements ReportCreatableInterface {}
