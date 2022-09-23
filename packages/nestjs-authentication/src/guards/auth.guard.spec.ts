import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  it('should be success', async () => {
    const guard = AuthGuard('jwt');
    // TODO: This need to be tested by e2e when we have Fastify integration
    expect(guard).toBeDefined();
  });
});
