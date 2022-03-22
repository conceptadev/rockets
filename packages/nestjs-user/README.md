# Rockets NestJS User

Rockets User Module

## Configuration

- [Seeding](#seeding)
  - [ENV](#env)

### Seeding

Configurations specific to (optional) database seeding.

#### ENV

Configurations available via environment.

| Variable                                 | Type       | Default        |                                      |
| ---------------------------------------- | ---------- | -------------- | ------------------------------------ |
| `USER_MODULE_SEEDER_AMOUNT`              | `<number>` | `50`           | number of additional users to create |
| `USER_MODULE_SEEDER_SUPERADMIN_USERNAME` | `<string>` | `'superadmin'` | super admin username                 |
