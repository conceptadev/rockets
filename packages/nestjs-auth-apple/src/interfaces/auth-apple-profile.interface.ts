import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuthAppleEmailsInterface } from './auth-apple-emails.interface';

export interface AuthAppleProfileInterface
  extends ReferenceIdInterface,
    Partial<ReferenceEmailInterface> {
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
    middleName?: string;
  };
  emails?: AuthAppleEmailsInterface[];
  _raw: string;
  _json: Record<string, unknown>;
}
