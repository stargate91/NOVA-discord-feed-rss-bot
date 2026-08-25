import { Pool, types, QueryResult, QueryResultRow } from 'pg';

// Force BIGINT (OID 20) to be returned as a string to prevent precision loss in JS
types.setTypeParser(20, (val: string) => val);

let pool: Pool;

const globalPool = global as unknown as { _postgresPool?: Pool };

if (!globalPool._postgresPool) {
  globalPool._postgresPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Run migrations in the background to ensure schema is up to date
  const ensureSchema = async () => {
    try {
      const client = await globalPool._postgresPool!.connect();
      try {
        await client.query("ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true");
        await client.query("ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 0");
        await client.query("ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT false");
        await client.query("ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP");
        await client.query("ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT");
        await client.query("ALTER TABLE guild_settings ADD COLUMN IF NOT EXISTS custom_branding TEXT");
        await client.query("ALTER TABLE monitors ADD COLUMN IF NOT EXISTS last_post_at TIMESTAMP WITH TIME ZONE");
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.error("[DB] Migration error:", err?.message || err);
    }
  };

  ensureSchema();
}

pool = globalPool._postgresPool;

export default pool;

export const query = <R extends QueryResultRow = any, I extends any[] = any[]>(
  text: string,
  params?: I
): Promise<QueryResult<R>> => pool.query<R>(text, params);
