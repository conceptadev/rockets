import {
  OtpModule,
  OtpService,
  OtpPostgresEntity,
  OtpSqliteEntity,
  OtpCreateDto,
} from './index';

describe('index', () => {
  it('should be an instance of Function', () => {
    expect(OtpModule).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(OtpService).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(OtpPostgresEntity).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(OtpSqliteEntity).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(OtpCreateDto).toBeInstanceOf(Function);
  });
});
