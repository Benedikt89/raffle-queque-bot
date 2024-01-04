import TelegramBot from 'node-telegram-bot-api';

export function delayPromise(t: number, val?: any) {
  return new Promise((resolve) => setTimeout(resolve, t, val));
}

export const typingPromise = async (
  bot: TelegramBot,
  userTgId: string,
  offset?: number,
) => {
  await bot.sendChatAction(userTgId, 'typing', {});
  await delayPromise(offset ?? 3000);
};
