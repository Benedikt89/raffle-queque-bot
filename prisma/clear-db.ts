import { PrismaClient } from '@prisma/client';

/** FUNCTION to clear seeded mock data from db, helps for testing **/

const prisma = new PrismaClient();
async function main() {
  const deletedUsersMailing = await prisma.mailing.deleteMany();
  const deletedUsersAntispam = await prisma.userAntispam.deleteMany();
  const deletedTickets = await prisma.tickets.deleteMany();
  const deletedWinners = await prisma.raffleWinners.deleteMany();
  const deletedRaffles = await prisma.raffle.deleteMany();
  const deletedUsers = await prisma.user.deleteMany();
  const deletedBot = await prisma.bot.deleteMany();

  console.log({
    deletedBot: deletedBot.count,
    deletedUsers: deletedUsers.count,
    deletedTickets: deletedTickets.count,
    deletedRaffles: deletedRaffles.count,
    deletedWinners: deletedWinners.count,
    deletedUsersAntispam: deletedUsersAntispam.count,
    deletedUsersMailing: deletedUsersMailing.count,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
