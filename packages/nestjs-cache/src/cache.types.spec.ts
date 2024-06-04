import { CacheResource } from './cache.types';

describe('Org Types', () => {
  describe('OrgResource enum', () => {
    it('should match', async () => {
      expect(CacheResource.One).toEqual('cache');
      expect(CacheResource.Many).toEqual('cache-list');
    });
  });
});
