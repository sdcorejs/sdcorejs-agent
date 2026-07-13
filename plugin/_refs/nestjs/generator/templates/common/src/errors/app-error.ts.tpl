import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export interface AppErrorBody {
  code: string;
  message: string;
  data?: Record<string, unknown>;
}
function statusForCode(code: string): number {
  if (code.endsWith('.not-found')) return HttpStatus.NOT_FOUND;
  if (code.endsWith('.forbidden')) return HttpStatus.FORBIDDEN;
  if (code.endsWith('.version-conflict')) return HttpStatus.CONFLICT;
  return HttpStatus.BAD_REQUEST;
}

export class AppError extends HttpException {
  constructor(
    public readonly code: string,
    message = code,
    public readonly data?: Record<string, unknown>,
  ) {
    super({ code, message, ...(data ? { data } : {}) } satisfies AppErrorBody, statusForCode(code));
  }
}

function defaultCode(status: number): string {
  if (status === HttpStatus.BAD_REQUEST) return 'request.invalid';
  if (status === HttpStatus.UNAUTHORIZED) return 'access.unauthorized';
  if (status === HttpStatus.FORBIDDEN) return 'access.forbidden';
  if (status === HttpStatus.NOT_FOUND) return 'resource.not-found';
  if (status === HttpStatus.CONFLICT) return 'resource.conflict';
  return 'internal.error';
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : undefined;
    if (raw && typeof raw === 'object' && 'code' in raw && typeof raw.code === 'string') {
      const message = 'message' in raw && typeof raw.message === 'string' ? raw.message : raw.code;
      const data = 'data' in raw && raw.data && typeof raw.data === 'object'
        ? raw.data as Record<string, unknown>
        : undefined;
      response.status(status).json({ code: raw.code, message, ...(data ? { data } : {}) } satisfies AppErrorBody);
      return;
    }
    const code = defaultCode(status);
    const message = raw && typeof raw === 'object' && 'message' in raw && typeof raw.message === 'string'
      ? raw.message
      : code;
    response.status(status).json({ code, message } satisfies AppErrorBody);
  }
}
