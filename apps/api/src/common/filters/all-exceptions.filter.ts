import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || message;
        code = resp.error || code;
        details = resp.errors || resp.details;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'A record with this information already exists';
          code = 'DUPLICATE_ENTRY';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          code = 'NOT_FOUND';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid reference - related record not found';
          code = 'INVALID_REFERENCE';
          break;
        default:
          this.logger.error(`Prisma error ${exception.code}:`, exception.message);
      }
    } else if (exception instanceof Error) {
      this.logger.error('Unhandled exception:', exception);
      // Don't expose internal errors in production
      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
      }
    }

    // Never log 4xx as errors in production
    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} - ${status}: ${message}`, exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
