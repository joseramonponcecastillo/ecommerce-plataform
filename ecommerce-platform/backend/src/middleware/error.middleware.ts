import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'El recurso ya existe (duplicado)',
      });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
      });
      return;
    }
  }

  console.error('ERROR:', err);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
