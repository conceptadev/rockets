import { Repository } from 'typeorm';
import { Type } from '@nestjs/common';
import { TypeOrmExtOrmOptionsInterface } from '@concepta/nestjs-typeorm-ext';
import { OrgEntityInterface } from './org-entity.interface';

export interface OrgOrmOptionsInterface extends TypeOrmExtOrmOptionsInterface {
  orm?: {
    entities?: {
      org?: { useClass?: Type<OrgEntityInterface> };
    };
    repositories?: {
      orgRepository?: { useClass?: Type<Repository<OrgEntityInterface>> };
    };
  };
}
