import { splitLogLevel } from './config-parser.util';

describe('config parser util', () => {
  describe('splitLogLevel()', () => {
    it('should return empty array', async () => {
      expect(splitLogLevel('')).toEqual([]);
    });

    it('should return single item arra', async () => {
      expect(splitLogLevel('error')).toEqual(['error']);
    });

    it('should return multi item array', async () => {
      expect(splitLogLevel('debug,error')).toEqual(['debug', 'error']);
    });

    it('should error on bad log level', async () => {
      const t = () => {
        splitLogLevel('bad');
      };
      expect(t).toThrow(Error);
      expect(t).toThrow('The string "bad" is not a valid log level.');
    });
  });
});
