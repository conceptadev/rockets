import { Action } from 'accesscontrol/lib/enums';
import { ActionEnum } from './action.enum';

describe('Access control action enumeration', () => {
  it('should match specification', () => {
    expect(ActionEnum).toEqual({
      CREATE: Action.CREATE,
      READ: Action.READ,
      UPDATE: Action.UPDATE,
      DELETE: Action.DELETE,
    });
  });
});
