import { Exclude } from 'class-transformer';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { ReportCreatableInterface } from '@concepta/ts-common';
import { ReportDto } from './report.dto';
import { ReportUpdatableInterface } from '@concepta/ts-common/src/report/interfaces/report-updatable.interface';

/**
 * Report Update DTO
 */
@Exclude()
export class ReportUpdateDto
  extends IntersectionType(
    PickType(ReportDto, ['status', 'file'] as const),
    PartialType(PickType(ReportDto, ['errorMessage'] as const))
  )
  implements ReportUpdatableInterface {}
