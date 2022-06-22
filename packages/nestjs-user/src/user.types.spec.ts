import { UserResource } from './user.types';

describe('User Types', () => {
  describe('UserResource enum', () => {
    it('should match', async () => {
      expect(UserResource.One).toEqual('user');
      expect(UserResource.Many).toEqual('user-list');
    });
  });
});
