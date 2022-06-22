import { OrgResource } from './org.types';

describe('Org Types', () => {
  describe('OrgResource enum', () => {
    it('should match', async () => {
      expect(OrgResource.One).toEqual('org');
      expect(OrgResource.Many).toEqual('org-list');
    });
  });
});
