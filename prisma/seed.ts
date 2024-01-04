import { seedMockDb } from '../test/utils/test-seed';

const mockUsersIds = ['some0', 'some1', 'some2'];
/** FUNCTION to seed mock data to db, helps for testing **/

async function main() {
  const res = await seedMockDb(mockUsersIds, { tickets: true });
  console.log('created ====>>>> ,', res);
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
