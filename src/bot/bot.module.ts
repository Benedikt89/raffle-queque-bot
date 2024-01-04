import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TemplateService } from './template.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import {ApiConfigModule} from "../providers/api-config/api.config.module";
import mainConfig from "../providers/api-config/main.config";
import {BotController} from "./api/bot.controller";
import {BotService} from "./application/bot.service";
import {PrismaService} from "../providers/database/prisma.service";
import {BotTasksService} from "./application/bot.tasks-service";

const commandHandlers = [];

const botCommands = [];

const domain = [];

@Module({
  imports: [
    CqrsModule,
    ApiConfigModule,
    ConfigModule.forRoot({ load: [mainConfig] }),
    ScheduleModule.forRoot(),
  ],
  controllers: [BotController],
  providers: [
    BotService,
    TemplateService,
    PrismaService,
    BotTasksService,
    ...commandHandlers,
    ...botCommands,
    ...domain,
  ],
})
export class BotModule {}
