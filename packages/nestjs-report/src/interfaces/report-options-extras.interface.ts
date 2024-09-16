import { DynamicModule } from '@nestjs/common';
import { ReportEntitiesOptionsInterface } from './report-entities-options.interface';

export interface ReportOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'>,
    Partial<ReportEntitiesOptionsInterface> {}
