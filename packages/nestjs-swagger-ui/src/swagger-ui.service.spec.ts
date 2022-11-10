import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SwaggerUiModule } from './swagger-ui.module';
import { SwaggerUiService } from './swagger-ui.service';

describe('SwaggerModule (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        SwaggerUiModule.register({
          settings: {
            path: 'api',
            basePath: '/v1',
            jsonSchemaFilePath: `${__dirname}/../jsonSchema-v4.json`,
            openApiFilePath: `${__dirname}/../open-api-v3.json`,
          },
        }),
      ],
    }).compile();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it.only('setup', async () => {
    app = module.createNestApplication();
    const swaggerUiService = app.get(SwaggerUiService);
    expect(swaggerUiService).toBeInstanceOf(SwaggerUiService);
    swaggerUiService.setup(app);
  });
});
