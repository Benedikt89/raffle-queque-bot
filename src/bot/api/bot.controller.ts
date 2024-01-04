import {Controller, Get} from "@nestjs/common";

@Controller('bot')
export class BotController {
  constructor() {}

  @Get('test')
  async test(): Promise<void> {
    console.log('hidden backend pool here');
  }
}
