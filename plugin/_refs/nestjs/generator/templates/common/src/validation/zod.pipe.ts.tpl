import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: 'request.invalid',
        message: 'Request validation failed.',
        data: { issues: result.error.issues.map((issue) => ({ path: issue.path.join('.'), code: issue.code })) },
      });
    }
    return result.data;
  }
}
