import { ReportCreatableInterface, ReportInterface } from '@concepta/ts-common';
import { LookupIdInterface, ReferenceId, ReferenceIdInterface } from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface ReportLookupServiceInterface
  extends LookupIdInterface<ReferenceId, ReportInterface, QueryOptionsInterface> {
  getUniqueReport(
    org: Pick<ReportCreatableInterface, 'serviceKey' | 'name'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReportInterface | null>;
  getWithFile(report: ReferenceIdInterface, queryOptions?: QueryOptionsInterface): Promise<ReportInterface | null>;
}
