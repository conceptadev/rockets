import { AuthUser } from './auth-user.decorator';

describe(AuthUser.name, () => {
  it('AuthUser should be imported', () => {
    expect(AuthUser).toBeInstanceOf(Function);
  });
});
