import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from './schema';

export function getDb() {
    const { env } = getCloudflareContext();
    if (!env.DB) {
        throw new Error("DB binding is missing. Ensure 'DB' is configured in wrangler.jsonc");
    }
    return drizzle(env.DB, { schema });
}
