export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(message, 400);
  }

  static unauthorized(message: string = 'No autorizado'): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = 'Acceso denegado'): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message: string = 'Recurso no encontrado'): ApiError {
    return new ApiError(message, 404);
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, 409);
  }

  static internal(message: string = 'Error interno del servidor'): ApiError {
    return new ApiError(message, 500, false);
  }
}
