import {Inject} from '@nestjs/common';
import {ACCESS_CONTROL_OPTIONS_KEY} from '../constants';

export const InjectAccessControl = () => Inject(ACCESS_CONTROL_OPTIONS_KEY);
