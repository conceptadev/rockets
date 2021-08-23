import {
  LoggerExceptionFilter,
  LoggerModule,
  LoggerRequestInterceptor,
  LoggerService,
  LoggerTransportService
} from './index';

describe('Index', () => {
  it('LoggerModule should be imported', () => {
    expect(LoggerModule).toBeInstanceOf(Function);
  });
  it('LoggerService should be imported', () => {
    expect(LoggerService).toBeInstanceOf(Function);
  });
  it('LoggerExceptionFilter should be imported', () => {
    expect(LoggerExceptionFilter).toBeInstanceOf(Function);
  });
  it('LoggerRequestInterceptor should be imported', () => {
    expect(LoggerRequestInterceptor).toBeInstanceOf(Function);
  });
  it('LoggerTransportService should be imported', () => {
    expect(LoggerTransportService).toBeInstanceOf(Function);
  });
});
