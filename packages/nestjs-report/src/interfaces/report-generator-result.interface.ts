import { ReportUpdatableInterface } from '@concepta/nestjs-common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';

export interface ReportGeneratorResultInterface
  extends ReportUpdatableInterface,
    ReferenceIdInterface {}
