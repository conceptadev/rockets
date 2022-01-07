import { CrudOptions } from '@nestjsx/crud';

export type CrudDecoratorOptionsInterface = Pick<CrudOptions, 'model' | 'dto'>;
