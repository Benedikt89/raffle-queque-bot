import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(5100),
        DATABASE_URL: Joi.string().default(
          'postgres://shuliakleonid:V43NPdOIrMhY@ep-royal-term-639972.eu-central-1.aws.neon.tech/neon2',
        ),
        BASE_URL: Joi.string().default('https://bot.telegiv.com:8443/api'),
      }),
      expandVariables: true,
    }),
  ],
  providers: [],
  exports: [],
})
export class ApiConfigModule {}
