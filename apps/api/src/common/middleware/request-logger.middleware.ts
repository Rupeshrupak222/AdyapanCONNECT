import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const log = `${method} ${originalUrl} ${statusCode} ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(log);
      } else if (statusCode >= 400) {
        this.logger.warn(log);
      } else {
        this.logger.log(log);
      }
    });

    next();
  }
}
