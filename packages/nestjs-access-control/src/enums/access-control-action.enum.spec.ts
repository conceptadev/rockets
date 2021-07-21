import { AccessControlAction } from './access-control-action.enum';

describe('Access control action enumeration', () => {
  it('should match specification', () => {
    expect(AccessControlAction).toEqual({
      CREATE: 'CREATE',
      READ: 'READ',
      UPDATE: 'UPDATE',
      DELETE: 'DELETE',
    });
  });
});
