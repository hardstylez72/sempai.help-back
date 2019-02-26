CREATE SCHEMA IF NOT EXISTS users;

CREATE TABLE IF NOT EXISTS "users"."users" (
  "id" SERIAL UNIQUE,
  "login" VARCHAR(40) NOT NULL,
  "password" VARCHAR(40) NOT NULL,
  "role_id" INTEGER NOT NULL,
  "is_deleted" BOOLEAN DEFAULT 'false',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE ("login", "password"),
  PRIMARY KEY ("id")
);
