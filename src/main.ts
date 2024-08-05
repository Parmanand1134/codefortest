import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as morgan from 'morgan';
import * as compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set up CORS
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());


  // Set up logging
  app.use(morgan('dev'));

  // Set up compression
  app.use(compression());

  // Set up Swagger
  // const config = new DocumentBuilder()
  //   .setTitle('Nest API')
  //   .setDescription('The Nest API description')
  //   .setVersion('1.0')
  //   .addTag('api')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('doc', app, document);

  const config = new DocumentBuilder()
  .setTitle('Test..')
  .setDescription('The Test API description')
  .setVersion('1.0')
  .addTag('api')
  .addBearerAuth(undefined, 'Authorization')
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
