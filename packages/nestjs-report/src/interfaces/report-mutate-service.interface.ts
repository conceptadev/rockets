import { ReportCreatableInterface } from '@concepta/ts-common';
import { CreateOneInterface, ReferenceIdInterface, UpdateOneInterface } from '@concepta/ts-core';
import { ReportEntityInterface } from './report-entity.interface';
import { ReportUpdatableInterface } from '@concepta/ts-common/src/report/interfaces/report-updatable.interface';

export interface ReportMutateServiceInterface
  extends CreateOneInterface<ReportCreatableInterface, ReportEntityInterface>,
  UpdateOneInterface<
    ReportUpdatableInterface & ReferenceIdInterface,
    ReportEntityInterface
  > {}
