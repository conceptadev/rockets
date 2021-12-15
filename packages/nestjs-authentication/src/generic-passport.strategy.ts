import { Type } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github';

const GenericPassportStrategy = (strategyName: string) => {
  const isExpress = true;

  const strategy: Type<Strategy> = getStrategy(isExpress, strategyName);

  if (isExpress) {
    return PassportStrategy(strategy, strategyName);
  } else {
    // TODO: change to get from fastify
    return PassportStrategy(strategy, strategyName);
  }
};

const getStrategy = (
  isExpress: boolean,
  strategyName: string,
): Type<Strategy> => {
  let strategy: Type<Strategy> = LocalStrategy;

  if (isExpress) {
    switch (strategyName) {
      case 'local':
        strategy = LocalStrategy;
        break;
      default:
        strategy = GitHubStrategy;
        break;
    }
  } else {
    switch (strategyName) {
      case 'local':
        strategy = LocalStrategy;
        break;
      default:
        strategy = GitHubStrategy;
        break;
    }
  }

  return strategy;
};

export default GenericPassportStrategy;
