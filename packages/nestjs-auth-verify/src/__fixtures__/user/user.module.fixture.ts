import { Global, Module } from '@nestjs/common';
import { UserModelServiceFixture } from './services/user-model.service.fixture';

@Global()
@Module({
  providers: [UserModelServiceFixture],
  exports: [UserModelServiceFixture],
})
export class UserModuleFixture {}
