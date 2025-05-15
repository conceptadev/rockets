import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';

import { REPORT_MODULE_REPORT_ENTITY_KEY } from '../report.constants';
import { ReportEntityInterface } from '@concepta/nestjs-common';

export interface ReportEntitiesOptionsInterface {
  [REPORT_MODULE_REPORT_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<ReportEntityInterface>;
}
