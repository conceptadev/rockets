import { Module } from '@nestjs/common';
import { EventModule } from '@rockts-org/nestjs-event';
import { UserModule } from '@rockts-org/nestjs-user';

@Module({
  imports: [
    UserModule.register(),
    // TODO: figure out how to mock TypeORM connection, it is not trivial
    // TypeOrmModule.forRootAsync({
    //   imports: [
    //     TypeOrmConfigModule.register({
    //       type: 'postgres',
    //       url: 'postgresql://postgres:postgres@localhost:5432/postgres',
    //     }),
    //   ],
    //   inject: [TypeOrmConfigService],
    //   useFactory: (typeOrmConfigService: TypeOrmConfigService) =>
    //     typeOrmConfigService.connectionOptions(),
    // }),
    EventModule.register(),
  ],
})
export class AppModule {}
