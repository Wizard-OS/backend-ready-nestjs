import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { I18nHttpExceptionFilter } from './common/filters/i18n-http-exception.filter';
import { I18nResponseInterceptor } from './common/interceptors/i18n-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(app.get(I18nHttpExceptionFilter));
  app.useGlobalInterceptors(app.get(I18nResponseInterceptor));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  logger.log(`App running on port ${port}`);
}
bootstrap();
