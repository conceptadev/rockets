import { Test, TestingModule } from '@nestjs/testing';
import { ValidateUserService } from './validate-user.service';

interface TestUser {
  id: string;
  active: boolean;
}
class ConcreteValidateUserService extends ValidateUserService {
  async validateUser(..._args: unknown[]): Promise<TestUser> {
    // Implementation of the abstract method for testing purposes
    return { id: 'user1', active: true } as TestUser;
  }
}

describe('ValidateUserService', () => {
  let service: ConcreteValidateUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConcreteValidateUserService],
    }).compile();

    service = module.get(ConcreteValidateUserService);
  });

  it('should return true if user is active', async () => {
    const user = { id: 'user1', active: true };
    expect(await service.isActive(user)).toBe(true);
  });

  it('should return false if user is not active', async () => {
    const user = { id: 'user1', active: false };
    expect(await service.isActive(user)).toBe(false);
  });
});
