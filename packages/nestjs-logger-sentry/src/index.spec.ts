import {
  LoggerSentryModule,
} from './index';

describe('Index', () => {
  it('LoggerSentryModule should be imported', () => {
    expect(LoggerSentryModule).toBeInstanceOf(Function);
  });
});
