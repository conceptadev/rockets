import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';

import { REPORT_MODULE_REPORT_ENTITY_KEY } from '../report.constants';
import { ReportEntityInterface } from './report-entity.interface';

export interface ReportEntitiesOptionsInterface {
  entities: {
    [REPORT_MODULE_REPORT_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<ReportEntityInterface>;
  };
}
