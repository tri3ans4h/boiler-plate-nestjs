import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';


async function bootstrap(){
  const app = await NestFactory.create(AppModule);
  const cors = {
    origin: ['http://localhost:3000', 'http://localhost:3001','http://192.168.1.6:3000','http://192.168.1.6:3001','http://192.168.10.137:3000'],
    methods: 'GET, HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: "Content-Type,Accept,Authorization",
    credentials: true,
  }
  const options = new DocumentBuilder()
    .setTitle('Template Swagger')
    .setDescription('API Template')
    .setVersion('1.0')
    //.addTag('cats')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);


  //app.useGlobalPipes(new ValidationPipe());

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  
  app.use(cookieParser());
  app.enableCors(cors)

 // await app.listen(3000);
  if (process.env.NODE_ENV == 'production') {
    await app.listen(3001);
  } else {
    await app.listen(3001);
  }
}
bootstrap();
