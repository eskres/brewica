/// <reference types="node" />
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "libs/db/src/lib/schema.prisma",
  migrations: {
    path: "libs/db/src/lib/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});