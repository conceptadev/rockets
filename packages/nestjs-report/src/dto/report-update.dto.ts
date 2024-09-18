import { ReportUpdatableInterface } from '@concepta/ts-common/src/report/interfaces/report-updatable.interface';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ReportDto } from './report.dto';

/**
 * Report Update DTO
 */
@Exclude()
export class ReportUpdateDto
  extends IntersectionType(
    PickType(ReportDto, ['status', 'file'] as const),
    PartialType(PickType(ReportDto, ['errorMessage'] as const)),
  )
  implements ReportUpdatableInterface {}
