# Rockets NestJS User

A module for managing a basic User entity, including controller with full CRUD, DTOs, sample data factory and seeder.

## Installation

`yarn add @concepta/nestjs-user`

## Usage

```ts
// ...
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '@concepta/nestjs-user';
import { CrudModule } from '@concepta/nestjs-crud';

@Module({
  imports: [
    TypeOrmExtModule.register({
      type: 'postgres',
      url: 'postgres://user:pass@localhost:5432/postgres',
    }),
    CrudModule.register(),
    UserModule.register(),
  ],
})
export class AppModule {}
```

## Configuration

*   [Seeding](#seeding)
    *   [ENV](#env)

### Seeding

Configurations specific to (optional) database seeding.

#### ENV

Configurations available via environment.

| Variable                                 | Type       | Default        |                                      |
| ---------------------------------------- | ---------- | -------------- | ------------------------------------ |
| `USER_MODULE_SEEDER_AMOUNT`              | `<number>` | `50`           | number of additional users to create |
| `USER_MODULE_SEEDER_SUPERADMIN_USERNAME` | `<string>` | `'superadmin'` | super admin username                 |
