import { CacheResource } from './cache.types';

describe('Cache Types', () => {
  describe('Cache enum', () => {
    it('should match', async () => {
      expect(CacheResource.One).toEqual('cache');
      expect(CacheResource.Many).toEqual('cache-list');
    });
  });
});
