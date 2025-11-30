import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  // driver: "d1-http", // Using sqlite for now as we don't have D1 credentials setup in environment for kit
});
