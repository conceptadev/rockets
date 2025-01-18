import { Global, Module } from '@nestjs/common';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { createEntityManagerMock } from '@concepta/typeorm-common';

@Global()
@Module({
  providers: [
    {
      provide: getEntityManagerToken(),
      useFactory: createEntityManagerMock,
    },
  ],
  exports: [getEntityManagerToken()],
})
export class TypeOrmModuleFixture {}
