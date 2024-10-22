import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { ReportCreatableInterface } from '@concepta/ts-common';
import { MutateService } from '@concepta/typeorm-common';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ReportEntityInterface } from '../interfaces/report-entity.interface';

import { ReportUpdatableInterface } from '@concepta/ts-common/src/report/interfaces/report-updatable.interface';
import { ReportCreateDto } from '../dto/report-create.dto';
import { ReportUpdateDto } from '../dto/report-update.dto';
import { ReportMutateServiceInterface } from '../interfaces/report-mutate-service.interface';
import { REPORT_MODULE_REPORT_ENTITY_KEY } from '../report.constants';

/**
 * Report mutate service
 */
@Injectable()
export class ReportMutateService
  extends MutateService<
    ReportEntityInterface,
    ReportCreatableInterface,
    ReportUpdatableInterface
  >
  implements ReportMutateServiceInterface
{
  protected createDto = ReportCreateDto;
  protected updateDto = ReportUpdateDto;

  /**
   * Constructor
   *
   * @param repo - instance of the report repo
   */
  constructor(
    @InjectDynamicRepository(REPORT_MODULE_REPORT_ENTITY_KEY)
    repo: Repository<ReportEntityInterface>,
  ) {
    super(repo);
  }
}
