import { registerAs } from '@nestjs/config';
import { GITHUB_MODULE_DEFAULT_SETTINGS_TOKEN } from '../github.constants';
import { GithubSettingsInterface } from '../interfaces/github-settings.interface';
import { GithubLoginDto } from '../dto/github-login.dto';

/**
 * Default configuration for auth local.
 */
export const githubDefaultConfig = registerAs(
  GITHUB_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): GithubSettingsInterface => ({
    /**
     * The login dto
     */
    loginDto: GithubLoginDto,
    clientId: process.env.GITHUB_CLIENT_ID || 'client_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'secret',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'callback_url',
  }),
);
