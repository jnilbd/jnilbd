// Which Postgres schema this site's tables live in.
// Lovable Cloud uses `public`; the Cloudflare build sets VITE_SUPABASE_DB_SCHEMA so the
// shared Supabase project serves this site's own schema.
const fromVite = (import.meta as any).env?.VITE_SUPABASE_DB_SCHEMA as string | undefined;
const fromProcess = typeof process !== 'undefined' ? (process as any).env?.SUPABASE_DB_SCHEMA : undefined;

export const DB_SCHEMA: string = fromVite || fromProcess || 'public';

// Storage bucket names are shared across sites in one project, so they carry the schema prefix.
export const bucket = (name: string): string => (DB_SCHEMA === 'public' ? name : `${DB_SCHEMA}-${name}`);
