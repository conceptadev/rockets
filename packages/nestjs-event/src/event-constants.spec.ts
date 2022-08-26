import {
  EVENT_MODULE_SETTINGS_TOKEN,
  EVENT_MODULE_EVENT_KEY_PREFIX,
  EVENT_MODULE_DEFAULT_EMITTER_SERVICE_SETTINGS_TOKEN,
  EVENT_MODULE_EMITTER_SERVICE_TOKEN,
} from './event-constants';

describe('Contants', () => {
  describe(EVENT_MODULE_SETTINGS_TOKEN, () => {
    it('Should match string', () => {
      expect(EVENT_MODULE_SETTINGS_TOKEN).toEqual(
        'EVENT_MODULE_SETTINGS_TOKEN',
      );
    });
  });

  describe(EVENT_MODULE_EMITTER_SERVICE_TOKEN, () => {
    it('Should match string', () => {
      expect(EVENT_MODULE_EMITTER_SERVICE_TOKEN).toEqual(
        'EVENT_MODULE_EMITTER_SERVICE_TOKEN',
      );
    });
  });

  describe(EVENT_MODULE_DEFAULT_EMITTER_SERVICE_SETTINGS_TOKEN, () => {
    it('Should match string', () => {
      expect(EVENT_MODULE_DEFAULT_EMITTER_SERVICE_SETTINGS_TOKEN).toEqual(
        'EVENT_MODULE_DEFAULT_EMITTER_SERVICE_SETTINGS_TOKEN',
      );
    });
  });

  describe(EVENT_MODULE_EVENT_KEY_PREFIX, () => {
    it('Should match string', () => {
      expect(EVENT_MODULE_EVENT_KEY_PREFIX).toEqual('ROCKETS_EVENT_');
    });
  });
});
