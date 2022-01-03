import { Inject, Injectable } from '@nestjs/common';
import {
  TypeOrmConfigEntitiesValues,
  TypeOrmConfigOptions,
  TypeOrmConfigSubscribersValues,
} from './typeorm-config.types';
import { TYPEORM_CONFIG_MODULE_OPTIONS_TOKEN } from './typeorm-config.constants';
import { EventDispatchService } from '@rockts-org/nestjs-event';
import { TypeOrmConfigEntitiesEvent } from './events/typeorm-config-entities.event';
import { TypeOrmConfigSubscribersEvent } from './events/typeorm-config-subscribers.event';

@Injectable()
export class TypeOrmConfigService {
  constructor(
    @Inject(TYPEORM_CONFIG_MODULE_OPTIONS_TOKEN)
    private options: TypeOrmConfigOptions,
    private dispatchService: EventDispatchService,
  ) {}

  public async connectionOptions(): Promise<TypeOrmConfigOptions> {
    return {
      ...this.options,
      entities: await this.loadEntities(),
      subscribers: await this.loadSubscribers(),
    };
  }

  private async loadEntities(): Promise<TypeOrmConfigOptions['entities']> {
    const event = new TypeOrmConfigEntitiesEvent([]);

    const eventValues: TypeOrmConfigEntitiesValues[] =
      await this.dispatchService.async(event);

    const entities: TypeOrmConfigOptions['entities'] = [];

    for (const eventValue of eventValues) {
      for (const entityArray of eventValue) {
        for (const entity of entityArray) {
          entities.push(entity);
        }
      }
    }

    return entities;
  }

  private async loadSubscribers(): Promise<
    TypeOrmConfigOptions['subscribers']
  > {
    const event = new TypeOrmConfigSubscribersEvent([]);

    const eventValues: TypeOrmConfigSubscribersValues[] =
      await this.dispatchService.async(event);

    const subscribers: TypeOrmConfigOptions['subscribers'] = [];

    for (const eventValue of eventValues) {
      for (const subscriberArray of eventValue) {
        for (const subscriber of subscriberArray) {
          subscribers.push(subscriber);
        }
      }
    }

    return subscribers;
  }
}
