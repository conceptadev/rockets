import { AuditInterface, ReferenceIdInterface } from '@concepta/ts-core';
import { ReportStatusEnum } from '../enum/report-status.enum';
// import { FileOwnableInterface } from '../../file/interfaces/file-ownable.interface';

/**
 * Interface representing a report entity
 */
export interface ReportInterface extends ReferenceIdInterface, AuditInterface {
  /**
   * Service key associated with the report
   */
  serviceKey: string;

  /**
   * Report name of the report
   */
  name: string;

  /**
   * Status of the report
   */
  status: ReportStatusEnum;

  /**
   * Error message (null if no error)
   */
  errorMessage: string | null;

  /**
   * Dynamic download URI for the report
   */
  downloadUrl?: string;

  file?: ReferenceIdInterface;
}
