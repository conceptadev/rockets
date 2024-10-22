import {
  ReportCreatableInterface,
  ReportUpdatableInterface,
} from '@concepta/ts-common';
import {
  CreateOneInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import { ReportEntityInterface } from './report-entity.interface';

export interface ReportMutateServiceInterface
  extends CreateOneInterface<ReportCreatableInterface, ReportEntityInterface>,
    UpdateOneInterface<
      ReportUpdatableInterface & ReferenceIdInterface,
      ReportEntityInterface
    > {}
