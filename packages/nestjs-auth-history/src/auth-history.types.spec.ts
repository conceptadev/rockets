import { AuthHistoryResource } from './auth-history.types';

describe('AuthHistory Types', () => {
  describe('AuthHistoryResource enum', () => {
    it('should match', async () => {
      expect(AuthHistoryResource.One).toEqual('auth-history');
      expect(AuthHistoryResource.Many).toEqual('auth-history-list');
    });
  });
});
