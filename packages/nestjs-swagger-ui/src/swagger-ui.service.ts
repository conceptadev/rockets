import { INestApplication, Inject, Injectable } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerUiSettingsInterface } from './interfaces/swagger-ui-settings.interface';
import { SWAGGER_UI_MODULE_SETTINGS_TOKEN } from './swagger-ui.constants';

@Injectable()
export class SwaggerUiService {
  /**
   * Document builder instance
   */
  private documentBuilder = new DocumentBuilder();

  /**
   * Constructor.
   *
   * @param settings swagger ui settings
   */
  constructor(
    @Inject(SWAGGER_UI_MODULE_SETTINGS_TOKEN)
    private settings: SwaggerUiSettingsInterface,
  ) {
    this.configure();
  }

  /**
   * Returns document builder instance.
   */
  builder(): DocumentBuilder {
    return this.documentBuilder;
  }

  /**
   * Setup.
   *
   * @param app Nest application instance
   */
  setup(app: INestApplication) {
    // create the document
    const document = SwaggerModule.createDocument(
      app,
      this.documentBuilder.build(),
      this.settings?.documentOptions,
    );

    // finally, set it up
    SwaggerModule.setup(
      this.settings.path,
      app,
      document,
      this.settings?.customOptions,
    );
  }

  /**
   * @private
   */
  private configure() {
    if (this.settings?.title)
      this.documentBuilder.setTitle(this.settings.title);

    if (this.settings?.description)
      this.documentBuilder.setDescription(this.settings.description);

    if (this.settings?.version)
      this.documentBuilder.setVersion(this.settings.version);

    if (this.settings?.termsOfService)
      this.documentBuilder.setTermsOfService(this.settings.termsOfService);

    if (this.settings?.basePath)
      this.documentBuilder.setBasePath(this.settings.basePath);

    if (this.settings?.contact) {
      const { name, url, email } = this.settings.contact;
      this.documentBuilder.setContact(name, url, email);
    }

    if (this.settings?.license) {
      const { name, url } = this.settings.license;
      this.documentBuilder.setLicense(name, url);
    }

    if (this.settings?.externalDoc) {
      const { description, url } = this.settings.externalDoc;
      this.documentBuilder.setExternalDoc(description, url);
    }

    if (this.settings?.tags) {
      for (const { name, description, externalDocs } of this.settings.tags) {
        this.documentBuilder.addTag(name, description, externalDocs);
      }
    }

    if (this.settings?.security) {
      for (const { name, options } of this.settings.security) {
        this.documentBuilder.addSecurity(name, options);
      }
    }

    if (this.settings?.securityRequirements) {
      for (const { name, requirements } of this.settings.securityRequirements) {
        this.documentBuilder.addSecurityRequirements(name, requirements);
      }
    }

    if (this.settings?.bearerAuth) {
      for (const { options, name } of this.settings.bearerAuth) {
        this.documentBuilder.addBearerAuth(options, name);
      }
    }

    if (this.settings?.basicAuth) {
      for (const { options, name } of this.settings.basicAuth) {
        this.documentBuilder.addBasicAuth(options, name);
      }
    }

    if (this.settings?.cookieAuth) {
      for (const { cookieName, options, securityName } of this.settings
        .cookieAuth) {
        this.documentBuilder.addCookieAuth(cookieName, options, securityName);
      }
    }

    if (this.settings?.oAuth2) {
      for (const { options, name } of this.settings.oAuth2) {
        this.documentBuilder.addOAuth2(options, name);
      }
    }

    if (this.settings?.apiKeys) {
      for (const { options, name } of this.settings.apiKeys) {
        this.documentBuilder.addApiKey(options, name);
      }
    }
  }
}
