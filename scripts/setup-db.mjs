// Creates tables in Neon and loads starter data the first time.
// Usage: npm run db:setup   (reads DATABASE_URL from .env.local)
import { readFile } from "node:fs/promises";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const seed = await readFile(new URL("../db/seed.sql", import.meta.url), "utf8");

try {
  await pool.query(schema);
  console.log("Schema is up to date.");

  const { rows } = await pool.query("SELECT count(*)::int AS n FROM organizers");
  if (rows[0].n === 0) {
    await pool.query(seed);
    console.log("Loaded starter data (organizers, eateries, sponsor, tasks).");
  } else {
    console.log("Organizers already exist, skipping starter data.");
  }

  const ops = await readFile(new URL("../db/seed-ops.sql", import.meta.url), "utf8");
  await pool.query(ops);
  console.log("Day-of operations data is in place (fills in only what is missing).");
} finally {
  await pool.end();
}
