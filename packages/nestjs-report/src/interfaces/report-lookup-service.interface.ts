import {
  ReportCreatableInterface,
  ReportInterface,
} from '@concepta/nestjs-common';
import {
  LookupIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface ReportLookupServiceInterface
  extends LookupIdInterface<
    ReferenceId,
    ReportInterface,
    QueryOptionsInterface
  > {
  getUniqueReport(
    org: Pick<ReportCreatableInterface, 'serviceKey' | 'name'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReportInterface | null>;
  getWithFile(
    report: ReferenceIdInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReportInterface | null>;
}
