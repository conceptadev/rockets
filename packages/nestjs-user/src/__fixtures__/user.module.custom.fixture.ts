import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModelCustomService } from './services/user-model.custom.service';
import { UserEntityFixture } from './user.entity.fixture';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserEntityFixture])],
  providers: [UserModelCustomService],
  exports: [UserModelCustomService],
})
export class UserModuleCustomFixture {}
