import {
  LoggerCoralogixModule,
  LoggerCoralogixTransport
} from './index';

describe('Index', () => {
  it('CoralogixModule should be imported', () => {
    expect(LoggerCoralogixModule).toBeInstanceOf(Function);
  });
  it('CoralogixCoralogixTransport should be imported', () => {
    expect(LoggerCoralogixTransport).toBeInstanceOf(Function);
  });
});
