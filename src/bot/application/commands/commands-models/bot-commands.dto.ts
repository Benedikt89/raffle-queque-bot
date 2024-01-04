import TelegramBot from 'node-telegram-bot-api';

export type BotCommandsDTO = {
  bot: TelegramBot & {token?: string};
  botId: number;
  botWebhookBody: any;
  botWebhookMessage: TelegramBot.Message;
};
