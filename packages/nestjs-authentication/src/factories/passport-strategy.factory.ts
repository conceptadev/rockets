import { NotImplementedException, Type } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';

export const PassportStrategyFactory = <T extends Strategy>(
  strategy: Type<T>,
  strategyName: string,
) => {
  const isExpress = true;

  if (isExpress) {
    return PassportStrategy<Type<T>>(strategy, strategyName);
  } else {
    // TODO: change to get from fastify
    throw new NotImplementedException();
  }
};
