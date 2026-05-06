import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    directUrl: process.env.DATABASE_URL_UNPOOLED
  },
  migrations: {
    seed: "bun prisma/seed.ts"
  }
});
