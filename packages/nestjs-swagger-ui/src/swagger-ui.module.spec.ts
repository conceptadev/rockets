import { Test, TestingModule } from '@nestjs/testing';
import { SwaggerUiSettingsInterface } from './interfaces/swagger-ui-settings.interface';
import { SWAGGER_UI_MODULE_SETTINGS_TOKEN } from './swagger-ui.constants';
import { SwaggerUiModule } from './swagger-ui.module';
import { SwaggerUiService } from './swagger-ui.service';

describe('SwaggerModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        SwaggerUiModule.register({
          settings: { path: 'api', basePath: '/v1' },
        }),
      ],
    }).compile();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is module defined', async () => {
    const swaggerUiModule = module.get(SwaggerUiModule);
    expect(swaggerUiModule).toBeInstanceOf(SwaggerUiModule);

    const swaggerUiService = module.get(SwaggerUiService);
    expect(swaggerUiService).toBeInstanceOf(SwaggerUiService);
  });

  it('settings were registered', async () => {
    const settings = module.get<SwaggerUiSettingsInterface>(
      SWAGGER_UI_MODULE_SETTINGS_TOKEN,
    );
    expect(settings.basePath).toEqual('/v1');
  });
});
