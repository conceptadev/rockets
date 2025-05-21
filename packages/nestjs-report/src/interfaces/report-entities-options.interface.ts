import {
  ReportEntityInterface,
  RepositoryEntityOptionInterface,
} from '@concepta/nestjs-common';
import { REPORT_MODULE_REPORT_ENTITY_KEY } from '../report.constants';

export interface ReportEntitiesOptionsInterface {
  [REPORT_MODULE_REPORT_ENTITY_KEY]: RepositoryEntityOptionInterface<ReportEntityInterface>;
}
