import { Injectable } from '@nestjs/common';
import {
  ModelService,
  ReferenceIdInterface,
  ReportCreatableInterface,
  ReportInterface,
  ReportUpdatableInterface,
  RepositoryInterface,
  InjectDynamicRepository,
  ReportEntityInterface,
} from '@concepta/nestjs-common';
import { ReportCreateDto } from '../dto/report-create.dto';
import { ReportUpdateDto } from '../dto/report-update.dto';
import { ReportModelServiceInterface } from '../interfaces/report-model-service.interface';
import { REPORT_MODULE_REPORT_ENTITY_KEY } from '../report.constants';
import { ReportServiceKeyMissingException } from '../exceptions/report-service-key-missing.exception';
import { ReportNameMissingException } from '../exceptions/report-name-missing.exception';
import { ReportQueryException } from '../exceptions/report-query.exception';

/**
 * Report model service
 */
@Injectable()
export class ReportModelService
  extends ModelService<
    ReportEntityInterface,
    ReportCreatableInterface,
    ReportUpdatableInterface
  >
  implements ReportModelServiceInterface
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
    repo: RepositoryInterface<ReportEntityInterface>,
  ) {
    super(repo);
  }

  async getUniqueReport(report: Pick<ReportInterface, 'serviceKey' | 'name'>) {
    if (!report.serviceKey) {
      throw new ReportServiceKeyMissingException();
    }
    if (!report.name) {
      throw new ReportNameMissingException();
    }
    return this.repo.findOne({
      where: {
        serviceKey: report.serviceKey,
        name: report.name,
      },
    });
  }

  async getWithFile(report: ReferenceIdInterface) {
    try {
      return this.repo.findOne({
        where: {
          id: report.id,
        },
      });
    } catch (originalError) {
      throw new ReportQueryException({ originalError });
    }
  }
}
