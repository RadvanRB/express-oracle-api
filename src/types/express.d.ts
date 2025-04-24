import { QueryOptions } from './filters';

declare global {
  namespace Express {
    interface Request {
      queryOptions: QueryOptions;
    }
  }
}