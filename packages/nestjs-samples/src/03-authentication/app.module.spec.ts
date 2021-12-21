import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';
import { AuthLocalController } from '@rockts-org/nestjs-auth-local-strategy';
import { UserLookupService } from './user/user-lookup.service';

describe('AppModule', () => {
  it('should be imported', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const userLookupService = module.get<UserLookupService>(UserLookupService);

    const controller = module.get<AuthLocalController>(AuthLocalController);

    expect(module).toBeInstanceOf(TestingModule);
    expect(userLookupService).toBeInstanceOf(UserLookupService);
    expect(controller).toBeInstanceOf(AuthLocalController);
  });
});
