import {
  ReportCreatableInterface,
  ReportUpdatableInterface,
} from '@concepta/nestjs-common';
import {
  CreateOneInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { ReportEntityInterface } from './report-entity.interface';

export interface ReportMutateServiceInterface
  extends CreateOneInterface<ReportCreatableInterface, ReportEntityInterface>,
    UpdateOneInterface<
      ReportUpdatableInterface & ReferenceIdInterface,
      ReportEntityInterface
    > {}
