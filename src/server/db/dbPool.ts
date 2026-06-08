import { Pool } from "pg";
import { getDatabaseUrl, isDatabaseConfigured } from "@/server/db/dbConfig";

let pool: Pool | null = null;

export const getDbPool = (): Pool => {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
  }

  return pool;
};
