import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    // Set request ID header in response
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-Request-ID', requestId);

    return next.handle().pipe(
      map((data) => {
        // Already formatted response (e.g. paginated)
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true,
          data,
          requestId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
