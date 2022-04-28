import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

export interface UserInterface
  extends ReferenceIdInterface,
    ReferenceEmailInterface,
    ReferenceUsernameInterface {}
