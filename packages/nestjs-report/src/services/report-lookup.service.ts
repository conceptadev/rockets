import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { LookupService, QueryOptionsInterface } from '@concepta/typeorm-common';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { REPORT_MODULE_REPORT_ENTITY_KEY } from '../report.constants';
import { ReportEntityInterface } from '../interfaces/report-entity.interface';
import { ReportLookupServiceInterface } from '../interfaces/report-lookup-service.interface';
import { ReportInterface } from '@concepta/ts-common';
import { ReportServiceKeyMissingException } from '../exceptions/report-service-key-missing.exception';
import { ReportnameMissingException } from '../exceptions/report-name-missing.exception';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { ReportQueryException } from '../exceptions/report-query.exception';

/**
 * Report lookup service
 */
@Injectable()
export class ReportLookupService
  extends LookupService<ReportEntityInterface>
  implements ReportLookupServiceInterface
{
  constructor(
    @InjectDynamicRepository(REPORT_MODULE_REPORT_ENTITY_KEY)
    repo: Repository<ReportEntityInterface>,
  ) {
    super(repo);
  }
  async getUniqueReport(
    report: Pick<ReportInterface, 'serviceKey' | 'name'>,
    queryOptions?: QueryOptionsInterface,
  ) {
    if (!report.serviceKey) {
      throw new ReportServiceKeyMissingException();
    }
    if (!report.name) {
      throw new ReportnameMissingException();
    }
    return this.findOne(
      {
        where: {
          serviceKey: report.serviceKey,
          name: report.name,
        },
      },
      queryOptions,
    );
  }

  async getWithFile(
    report: ReferenceIdInterface,
    queryOptions?: QueryOptionsInterface,
  ) {
    try {
      return this.findOne({
          where: {
            id: report.id,
          },
          relations: ['file'],
        },
        queryOptions,
      );
    } catch (originalError) {
      throw new ReportQueryException({ originalError });
    }
  }
}
