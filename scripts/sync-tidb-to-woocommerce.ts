import 'dotenv/config';
import { runWooSync } from '@/lib/sync/woo';

async function main() {
  try {
    const summary = await runWooSync({ triggeredBy: 'manual' });
    console.log('WooCommerce sync completed:', summary);
    process.exit(0);
  } catch (error) {
    console.error('WooCommerce sync failed', error);
    process.exit(1);
  }
}

main();
