/// <reference types="node" />
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'libs/db/src/lib/schema.prisma',
  migrations: {
    path: 'libs/db/src/lib/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? undefined,
  },
});
