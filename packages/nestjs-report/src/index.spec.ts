import {
  ReportCreateDto,
  ReportDto,
  ReportModule,
  ReportService,
} from './index';

describe('Report Module', () => {
  it('should be a function', () => {
    expect(ReportModule).toBeInstanceOf(Function);
  });
});

describe('Report Service', () => {
  it('should be a function', () => {
    expect(ReportService).toBeInstanceOf(Function);
  });
});

describe('Report Dto', () => {
  it('should be a function', () => {
    expect(ReportDto).toBeInstanceOf(Function);
  });
});

describe('Report Create Dto', () => {
  it('should be a function', () => {
    expect(ReportCreateDto).toBeInstanceOf(Function);
  });
});
