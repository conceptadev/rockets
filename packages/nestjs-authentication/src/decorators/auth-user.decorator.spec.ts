import { AuthUser } from './auth-user.decorator';

describe('Index', () => {
  it('AuthUser should be imported', () => {
    expect(AuthUser).toBeInstanceOf(Function);
  });
});
