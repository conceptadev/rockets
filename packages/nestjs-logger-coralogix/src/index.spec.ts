import { LoggerCoralogixModule, LoggerCoralogixTransport } from './index';

jest.mock('axios', () => {
  return {
    post: jest.fn(() => Promise.resolve({ data: {} })),
  };
});

describe('Index', () => {
  it('CoralogixModule should be imported', () => {
    expect(LoggerCoralogixModule).toBeInstanceOf(Function);
  });
  it('CoralogixCoralogixTransport should be imported', () => {
    expect(LoggerCoralogixTransport).toBeInstanceOf(Function);
  });
});
