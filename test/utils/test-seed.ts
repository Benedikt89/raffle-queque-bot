import { PrismaClient } from '@prisma/client';
import {setMinskTimeZone} from "../../src/utils/time-utils";

const prisma = new PrismaClient();

const today = new Date();
const tomorrow = new Date();
tomorrow.setHours(today.getHours() + 27);

const raffleId = 14;

const testBot = {
  token: '6542702244:AAGS8r-RzS-kJ8_F9td1DJ01sZJnNUYe0kU',
  customer_id: 1,
  username: 'ben_test_more_test_bot',
  first_name: 'ben-test-bot',
};

export async function seedMockDb(
  mockUsersIds: string[],
  params?: { offset?: number; tickets?: boolean },
) {
  // TODO: create env to use test db
  try {
    if (params?.offset) {
      tomorrow.setHours(tomorrow.getHours() + params.offset);
    }
    const customer = await prisma.customers.upsert({
      where: { email_address: 'some@asdw_ss.test' },
      create: {
        email_address: 'some@asdw_ss.test',
        password_hash: 'some@asdw_ss.test',
      },
      update: {
        email_address: 'some@asdw_ss.test',
        password_hash: 'some@asdw_ss.test',
      },
    });
    const bot = await prisma.bot.upsert({
      where: { token: testBot.token },
      create: { ...testBot, customer_id: customer.id },
      update: { ...testBot, customer_id: customer.id },
    });
    const testRaffle: any = {
      id: raffleId,
      botId: bot.id,
      active: true,
      startDate: setMinskTimeZone(new Date()),
      endDate: setMinskTimeZone(tomorrow),
      pictureLink:
        'https://telegiv.s3.eu-central-1.amazonaws.com/raffles/avatar/49_avatar.jpg',
      prizes: ['AAAAAVtomobile 1', 'AAAAAVtomobile 2', 'AAAAAVtomobile 3'],
      title: 'AAAAAVtomobile',
      description: 'У тебя есть возможность выиграть новенькую машину.',
      tgChannelsLinks: ['https://t.me/meme'],
    };
    const raffle = await prisma.raffle.create({ data: testRaffle });
    const dbUsers = await Promise.all(
      mockUsersIds.map((userTgId) =>
        prisma.user.create({
          data: {
            userTgId,
            uniqueName: userTgId,
            botToken: testBot.token,
            mailing: {
              create: [{ botId: bot.id, raffleId: raffle.id }],
            },
            tickets: params?.tickets
              ? {
                  create: [
                    {
                      raffleId: raffle.id,
                      ticketsAmount: 1,
                      bonusReceivedStatus: false,
                      lastDateBonusSend: setMinskTimeZone(new Date()),
                    },
                  ],
                }
              : undefined,
          },
        }),
      ),
    );

    await prisma.$disconnect();
    return {
      bot,
      dbUsers,
      dbRaffle: raffle,
    };
  } catch (e) {
    console.log(e);
    await prisma.$disconnect();
    return {};
  }
}

export async function clearMockDb(mockUsersIds: string[], raffleId: number) {
  try {
    const deletedUsersMailing = await prisma.mailing.deleteMany({
      where: { user: { userTgId: { in: mockUsersIds } } },
    });
    const deletedUsersAntispam = await prisma.userAntispam.deleteMany({
      where: { userTgId: { in: mockUsersIds } },
    });
    const deletedWinners = await prisma.raffleWinners.deleteMany({
      where: { raffleId: raffleId },
    });
    const deletedTickets = await prisma.tickets.deleteMany({
      where: {
        user: { userTgId: { in: mockUsersIds } },
      },
    });
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        userTgId: { in: mockUsersIds },
      },
    });
    const deletedRaffles = await prisma.raffle.deleteMany({
      where: { bot: { token: testBot.token } },
    });
    await prisma.raffles.deleteMany({ where: { id: raffleId } });
    const deletedBots = await prisma.bot.deleteMany({
      where: { token: testBot.token },
    });
    console.log(
      'deleted',
      deletedUsersMailing,
      deletedUsersAntispam,
      deletedWinners,
      deletedBots,
      deletedTickets,
      deletedUsers,
      deletedRaffles,
    );
    await prisma.$disconnect();
  } catch (e) {
    await prisma.$disconnect();
  }
}
