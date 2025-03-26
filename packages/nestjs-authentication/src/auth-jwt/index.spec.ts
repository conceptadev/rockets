import {
  AuthJwtModule,
  AuthJwtStrategy,
  AuthJwtGuard,
  JwtAuthGuard,
} from './index';

describe('Index', () => {
  it('AuthJwtModule should be imported', () => {
    expect(AuthJwtModule).toBeInstanceOf(Function);
  });

  it('AuthJwtStrategy should be imported', () => {
    expect(AuthJwtStrategy).toBeInstanceOf(Function);
  });

  it('AuthJwtGuard should be imported', () => {
    expect(AuthJwtGuard).toBeInstanceOf(Function);
  });

  it('JwtAuthGuard should be imported', () => {
    expect(JwtAuthGuard).toBeInstanceOf(Function);
  });
});
