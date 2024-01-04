import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mainConfig from './providers/api-config/main.config';
import { ApiConfigModule } from './providers/api-config/api.config.module';
import {BotModule} from "./bot/bot.module";

@Module({
  imports: [
    ApiConfigModule,
    BotModule,
    ConfigModule.forRoot({ load: [mainConfig] }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
