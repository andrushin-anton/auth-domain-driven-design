import { NextFunction, Request, Response } from 'express';
import { CustomError } from '@common/errors/custom-error';

/* eslint-disable */
export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).send({ errors: err.serializeErrors() });
    }
  
    console.error(err);
    return res.status(400).send({
      errors: [{ message: 'Something went wrong' }],
    });
  };
/* eslint-enable */
