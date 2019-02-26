CREATE SCHEMA IF NOT EXISTS links;

CREATE TABLE IF NOT EXISTS "links"."links" (
  "id" SERIAL UNIQUE,
  "link" VARCHAR(1000) NOT NULL,
  "descr" VARCHAR(4000) NOT NULL,
  "user_id" INTEGER NOT NULL,
  "abstract" VARCHAR(200) NOT NULL,
  "deleted" BOOLEAN DEFAULT 'false',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY ("id")
);

