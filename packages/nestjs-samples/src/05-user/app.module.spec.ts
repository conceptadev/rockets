import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
// import { TypeOrmConfigService } from '@rockts-org/nestjs-typeorm-config';
import { UserModule } from '@rockts-org/nestjs-user';

describe('AppModule', () => {
  let userModule: UserModule;
  // let typeOrmConfigService: TypeOrmConfigService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userModule = app.get<UserModule>(UserModule);
    userModule.onModuleInit();

    // typeOrmConfigService = app.get<TypeOrmConfigService>(TypeOrmConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(userModule).toBeInstanceOf(UserModule);
      // expect(typeOrmConfigService).toBeInstanceOf(TypeOrmConfigService);
    });
  });
});
