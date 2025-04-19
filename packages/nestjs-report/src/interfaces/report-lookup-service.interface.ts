import {
  ReportCreatableInterface,
  ReportInterface,
} from '@concepta/nestjs-common';
import {
  ByIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface ReportLookupServiceInterface
  extends ByIdInterface<ReferenceId, ReportInterface> {
  getUniqueReport(
    org: Pick<ReportCreatableInterface, 'serviceKey' | 'name'>,
  ): Promise<ReportInterface | null>;
  getWithFile(report: ReferenceIdInterface): Promise<ReportInterface | null>;
}
