import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { appConfig } from './configuration/app.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import {globalCatch} from "./utils/error-utils";

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  const mainConfig = configService.get('main', { infer: true });
  const PORT = mainConfig.PORT;

  const createdApp = appConfig(app);

  await createdApp.listen(PORT).then(async () => {
    globalCatch();
    console.log(`Server is listening on ${PORT}`);
  });
}
bootstrap();
