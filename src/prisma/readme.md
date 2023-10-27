exception handler for prisma


Usage:
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';

{
....
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
....

}


