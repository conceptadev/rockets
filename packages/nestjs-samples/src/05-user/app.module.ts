import { Module } from '@nestjs/common';
import { EventModule } from '@rockts-org/nestjs-event';
import { TypeOrmConfigModule } from '@rockts-org/nestjs-typeorm-config';
import { User, UserModule } from '@rockts-org/nestjs-user';
import {
  ConnectionOptions,
  Entity,
  EntityRepository,
  FindConditions,
  FindManyOptions,
  getConnectionManager,
  Repository,
} from 'typeorm';

@Entity()
export class CustomUser extends User {
  foo? = 'wassup';
}

@EntityRepository(CustomUser)
export class CustomUserRepository extends Repository<CustomUser> {
  version? = 'override';

  async find(options?: FindManyOptions<CustomUser>): Promise<CustomUser[]>;
  async find(conditions?: FindConditions<CustomUser>): Promise<CustomUser[]>;
  async find(
    optionsOrConditions?:
      | FindManyOptions<CustomUser>
      | FindConditions<CustomUser>,
  ): Promise<CustomUser[]> {
    const users: CustomUser[] = [new CustomUser()];
    return users;
  }
}

@Module({
  imports: [
    TypeOrmConfigModule.registerAsync({
      useFactory: async () => {
        return {
          type: 'postgres',
        };
      },
      connectionFactory: async (options: ConnectionOptions) => {
        const c = getConnectionManager().create(options);
        c['buildMetadatas']();
        return c;
      },
    }),
    UserModule.register({
      orm: {
        entities: {
          user: { useClass: CustomUser },
        },
        repositories: {
          userRepository: { useClass: CustomUserRepository },
        },
      },
    }),
    EventModule.register(),
  ],
})
export class AppModule {}
