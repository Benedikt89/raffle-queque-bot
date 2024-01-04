import { pipeSetup } from './pipe.setup';
import { exceptionFilterSetup } from './exception-filter.setup';
import { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Need for use without testing
 * @param app
 */
export const appConfig = (app: NestExpressApplication) => {
  //base config for all app
  baseAppConfig(app);
  //use custom logger
  //add cors
  /* const cors = {
    origin: [],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
  };
  app.enableCors(cors);*/
  return app;
};

/**
 * Start config for testing and all APP
 * @param app
 */

export const baseAppConfig = (app: NestExpressApplication) => {
  //pipe validation
  pipeSetup(app);
  //exception filter
  exceptionFilterSetup(app);
};
