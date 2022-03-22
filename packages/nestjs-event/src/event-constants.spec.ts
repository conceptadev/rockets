import {
  EVENT_MODULE_OPTIONS_TOKEN,
  EVENT_MODULE_EVENT_KEY_PREFIX,
  EVENT_MODULE_DEFAULT_EMITTER_SERVICE_SETTINGS_TOKEN,
  EVENT_MODULE_EMITTER_SERVICE_TOKEN,
} from './event-constants';

describe('Contants', () => {
  it('Options token should be correct', () => {
    expect(EVENT_MODULE_OPTIONS_TOKEN).toEqual('EVENT_MODULE_OPTIONS_TOKEN');
  });
  it('Emitter service token should be correct', () => {
    expect(EVENT_MODULE_EMITTER_SERVICE_TOKEN).toEqual(
      'EVENT_MODULE_EMITTER_SERVICE_TOKEN',
    );
  });
  it('Default emitter service settings token should be correct', () => {
    expect(EVENT_MODULE_DEFAULT_EMITTER_SERVICE_SETTINGS_TOKEN).toEqual(
      'EVENT_MODULE_DEFAULT_EMITTER_SERVICE_SETTINGS_TOKEN',
    );
  });
  it('Event key prefix should be correct', () => {
    expect(EVENT_MODULE_EVENT_KEY_PREFIX).toEqual('ROCKETS_EVENT_');
  });
});
