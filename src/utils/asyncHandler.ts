import { Request, Response, NextFunction } from "express";

/**
 * Wrapper pro asynchronní handlery - zajišťuje, že chyby budou zachyceny middlewarem pro zpracování chyb
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};