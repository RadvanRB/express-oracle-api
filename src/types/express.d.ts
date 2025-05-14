import { QueryOptions } from './filters';

declare global {
  namespace Express {
    interface Request {
      // Nastavení pro zpracování dotazů
      queryOptions: QueryOptions;
      
      // Unikátní ID požadavku pro účely logování
      id?: string;
    }
  }
}