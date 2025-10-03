import 'dotenv/config';
import { runAlgoliaSync } from '@/lib/sync/algolia';

async function main() {
  try {
    const summary = await runAlgoliaSync({ triggeredBy: 'manual' });
    console.log('Algolia sync completed:', summary);
    process.exit(0);
  } catch (error) {
    console.error('Algolia sync failed', error);
    process.exit(1);
  }
}

main();
