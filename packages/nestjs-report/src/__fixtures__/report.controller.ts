import { ReportService } from '../services/report.service';
import { ReportCreateDto } from '../dto/report-create.dto';

export class ReportController {
  constructor(private reportService: ReportService) {}

  async create(reportDto: ReportCreateDto) {
    return this.reportService.generate({
      ...reportDto,
      serviceKey: 'my-aws-storage',
    });
  }

  async get(reportId: string) {
    return this.reportService.fetch({
      id: reportId,
    });
  }
}
