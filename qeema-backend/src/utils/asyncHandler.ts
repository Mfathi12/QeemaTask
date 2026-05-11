import type { NextFunction, Request, RequestHandler, Response } from "express";

export type AsyncRequestHandler<
  Req extends Request = Request,
  Res extends Response = Response,
> = (req: Req, res: Res, next: NextFunction) => Promise<void | unknown>;

/**
 * Wraps async route handlers so rejected promises are forwarded to Express error middleware.
 */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
}
