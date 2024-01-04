import { Injectable } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { CommandBus } from '@nestjs/cqrs';
import { UserAntispam } from '@prisma/client';
import {PrismaService} from "../../providers/database/prisma.service";
import {BotCommandsDTO} from "./commands/commands-models/bot-commands.dto";
import {BotStartCommand} from "./commands/bot-start-cmd.handler";
import {nowDateIsAfter} from "../../utils/time-utils";

@Injectable()
export class BotService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  async sendResponseByBot(dto: {
    botToken: string;
    botId: number;
    body: any;
  }): Promise<void> {
    const { botToken, botId, body } = dto;

    /*
     * логика ответа пользователю должна быть на вебхуке.
     * пользователь взаимодействует с ботом => бот идет на свой вебхук => вебхук говорит что отвечать боту
     * если сделать наоборот логику при создании бота то бот ничего делать не будет. я уже проверил
     * */
    const bot: TelegramBot = new TelegramBot(botToken, { polling: false });

    // запрещает спамить юзерам
    const antispamSystem = async (): Promise<boolean> => {
      const userTgId: number =
        body.message?.from?.id || body.callback_query?.from?.id;

      const foundedUserAntispam: UserAntispam | null =
        await this.prisma.userAntispam.findUnique({
          where: { userTgId: String(userTgId) },
        });

      const updateUserAntispamMessagesAmount = async (
        messagesAmount?: number,
      ): Promise<void> => {
        await this.prisma.userAntispam.update({
          where: { userTgId: String(userTgId) },
          data: {
            messagesAmount: messagesAmount ?? { increment: 1 },
            lastMessageDate: new Date().toString(),
          },
        });
      };

      if (foundedUserAntispam) {
        const userMessagesAmount: number = foundedUserAntispam.messagesAmount;

        const userLastMessageDate: string = foundedUserAntispam.lastMessageDate;

        const nowDateIsAfterLastUserMessageWithOneMinute = nowDateIsAfter(userLastMessageDate);

        // если количество сообщений больше 5 значит пользователь заблокирован на минуту
        if (userMessagesAmount > 5) {
          // если дата сейчас идет позже чем последнее сообщение юзера + 1 минута
          // то есть время блокировки на минуту уже прошло
          if (nowDateIsAfterLastUserMessageWithOneMinute) {
            // юзер снова может обращаться к боту спустя минуту блокировки
            updateUserAntispamMessagesAmount(1);

            return true;
          } else {
            // если время блокировки не прошло то дальше игнор юзера
            return false;
          }
          //   если юзер обращается к боту но у него количество обращений уже 5
          //   то нужно смотреть время. если прошла минута с последнего обращения
          //   то не блокировать. если не прошла и это 6 обращение то заблокировать на минуту
        } else if (userMessagesAmount === 5) {
          // если 6 обращение к боту идет после того как прошла минута с последнего сообщения
          // то все норм
          if (nowDateIsAfterLastUserMessageWithOneMinute) {
            updateUserAntispamMessagesAmount(1);

            return true;
          } else {
            // если 6 обращение к боту идет пока не прошла минута с последнего сообщения
            // то он будет заблокирован на минуту
            await updateUserAntispamMessagesAmount();

            await bot.sendMessage(
              userTgId,
              `Оёёй, мне пришло очень много сообщений. Мне нужна передышка на 1 минуту😌`,
            );

            return false;
          }
        } else if (userMessagesAmount < 5) {
          // если количество сообщений юзера меньше 5 и прошла минута с последнего сообщения
          // то нужно скинуть счетчик сообщений на начало
          // если минута с последнего сообщения не прошла то нужно поднять количество сообщений за минуту
          if (nowDateIsAfterLastUserMessageWithOneMinute) {
            updateUserAntispamMessagesAmount(1);

            return true;
          }

          updateUserAntispamMessagesAmount();

          return true;
        }
      } else {
        return true;
      }
    };

    const antispamStatus: boolean = await antispamSystem();

    // если антиспам вернул false значит этого юзера нужно игнорировать
    if (!antispamStatus) {
      return;
    }

    // обработчик обычных команд
    bot.on(
      'text',
      async (
        msg: TelegramBot.Message & {
          // is_premium. это свойство приходит если боту пишет сообщение пользователь со статусом премиум
          // оно содержит true. если у юзера премиума нет то этого свойства вообще не приходит
          from: TelegramBot.User & { is_premium?: true };
        },
      ): Promise<void> => {
        const chatId: number = msg.from.id;

        const userTextMessage: string = msg.text;
        console.log('=>(bot.service.ts:154) userTextMessage', userTextMessage);

        const botCommandsDTO: BotCommandsDTO = {
          bot,
          botId,
          botWebhookBody: body,
          botWebhookMessage: msg,
        };

        const botCommands = {
          '/start': new BotStartCommand(botCommandsDTO),
        };

        try {
          if (botCommands[userTextMessage]) {
            this.commandBus.execute(botCommands[userTextMessage]);
          } else {
            if (userTextMessage.indexOf('/start') < 0) {
              bot.sendMessage(chatId, `Упс... Я тебя не понимаю🙄`);
            }
          }
        } catch (err) {
          console.log('=>(bot.service.ts:173) err', err);
        }
      },
    );

    bot.on(
      'callback_query',
      async (query: TelegramBot.CallbackQuery): Promise<void> => {
        const botInlineBtnsDTO = {
          bot,
          callbackQuery: query,
          botId,
        };

        console.log(botInlineBtnsDTO)
      },
    );

    // если не написать processUpdate то бот ничего не ответит после запроса на вебхук
    bot.processUpdate(body);
  }
}
