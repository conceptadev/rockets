# Rockets NestJS Swagger UI

The Swagger UI module provides a simple implementation of the
[@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger) module.

By using this module, you can register the Swagger UI just like a normal module
to reduce the amount of boilerplate in your main.ts.

## Usage

app.module.ts

```ts
@Module({
  imports: [
    SwaggerUiModule.register({
      settings: {
        path: 'api',
        basePath: '/v1',
      },
    }),
  ],
})
export class AppModule {}
```

main.ts

```ts
async function bootstrap() {
  // create app
  const app = await NestFactory.create(AppModule);
  // get the swagger ui service
  const swaggerUiService = app.get(SwaggerUiService);
  // set it up
  swaggerUiService.setup(app);
  // start listening
  await app.listen(3000);
}
bootstrap();
```

## Configuration

All of the options in the official docs for
[NestJS OpenApi](https://docs.nestjs.com/openapi) are supported.

To see how they are mapped to the registration options `settings` property,
see the [SwaggerUiSettingsInterface](./src/interfaces/swagger-ui-settings.interface.ts)
