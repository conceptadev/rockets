import { ReportException } from './report.exception';

export class ReportMissingEntitiesOptionsException extends ReportException {
  constructor() {
    super({
      message: 'You must provide the entities option',
    });
    this.errorCode = 'REPORT_MISSING_ENTITIES_OPTION';
  }
}
