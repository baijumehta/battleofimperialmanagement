import { neon } from "@neondatabase/serverless";

let client: ReturnType<typeof neon> | null = null;

// Tagged-template SQL against Neon over HTTP. Values are always sent as parameters.
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client(strings, ...values) as Promise<Record<string, any>[]>;
}
