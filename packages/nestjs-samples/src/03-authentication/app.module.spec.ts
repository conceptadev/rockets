import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AppModule } from './app.module';
import { AuthLocalController } from '@rockts-org/nestjs-auth-local';
import { User, UserLookupService } from '@rockts-org/nestjs-user';
import { Repository } from 'typeorm';

describe('AppModule', () => {
  it('should be imported', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('USER_MODULE_ORM_ENTITY_TOKEN')
      .useValue(mock<User>())
      .overrideProvider('USER_MODULE_ORM_REPO_TOKEN')
      .useValue(mock<Repository<User>>())
      .compile();

    const userLookupService = module.get<UserLookupService>(UserLookupService);

    const controller = module.get<AuthLocalController>(AuthLocalController);

    expect(module).toBeInstanceOf(TestingModule);
    expect(userLookupService).toBeInstanceOf(UserLookupService);
    expect(controller).toBeInstanceOf(AuthLocalController);
  });
});
