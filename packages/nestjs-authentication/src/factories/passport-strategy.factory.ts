import { NotImplementedException, Type } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';

export const PassportStrategyFactory = (
  strategy: Type<Strategy>,
  strategyName: string,
) => {
  const isExpress = true;

  if (isExpress) {
    return PassportStrategy(strategy, strategyName);
  } else {
    // TODO: change to get from fastify
    throw new NotImplementedException();
  }
};
