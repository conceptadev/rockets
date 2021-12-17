import { NotImplementedException, Type } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';

const GenericPassportStrategy = (
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

export default GenericPassportStrategy;
