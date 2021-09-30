import {
  EVENT_MODULE_OPTIONS_TOKEN,
  EVENT_MODULE_EVENT_KEY_PREFIX,
} from './event-constants';

describe('Contants', () => {
  it('Options token should be correct', () => {
    expect(EVENT_MODULE_OPTIONS_TOKEN).toEqual('EVENT_MODULE_OPTIONS_TOKEN');
  });
  it('Event key prefix should be correct', () => {
    expect(EVENT_MODULE_EVENT_KEY_PREFIX).toEqual('ROCKETS_EVENT_');
  });
});
