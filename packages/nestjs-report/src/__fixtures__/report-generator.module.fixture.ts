import { Global, Module } from '@nestjs/common';
import { MyReportGeneratorService } from './my-report-generator.service';
import { MyReportGeneratorShortDelayService } from './my-report-generator-short-delay.service';

@Global()
@Module({
  providers: [MyReportGeneratorService, MyReportGeneratorShortDelayService],
  exports: [MyReportGeneratorService, MyReportGeneratorShortDelayService],
})
export class ReportGeneratorModuleFixture {}
