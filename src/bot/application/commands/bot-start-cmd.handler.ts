import {
  CommandBus,
  CommandHandler,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { BotCommandsDTO } from './commands-models/bot-commands.dto';

export class BotStartCommand implements ICommand {
  constructor(
    public readonly data: BotCommandsDTO & {
      referralData?: {
        referralOwnerTgId: string;
        botToken: string;
        referralType: string;
      };
    },
  ) {}
}

@CommandHandler(BotStartCommand)
export class BotStartCommandHandler
  implements ICommandHandler<BotStartCommand, void>
{
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  async execute({ data }: BotStartCommand): Promise<void> {
    // добавляю первичную информацию про юзера. его tgId
    // добавляю информацию про то какого бота использует юзер
    // botId, chatId(нужен для рассылок по чатам с пользователями), userId
    // нужно чтобы понимать сколько людей и каким ботом пользуются
    console.log('==============>>>>>>>>>> /start ', data.referralData);
    // если в стартовой команде есть id хозяина реферальной ссылки

    console.log(data)
  }

}
