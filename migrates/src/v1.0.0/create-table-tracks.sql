CREATE SCHEMA IF NOT EXISTS tracks;

CREATE TABLE IF NOT EXISTS "tracks"."tracks" (
  "id" SERIAL,
  "name" VARCHAR(2048) NOT NULL,
  "path_depth" INTEGER,
  "is_directory" BOOLEAN DEFAULT 'false',
  "path" VARCHAR(2048),
  "parent_path" VARCHAR(2048),
  "user_id" INTEGER REFERENCES "users"."users" ("id") ON DELETE
  SET
    NULL ON UPDATE CASCADE,
    "is_deleted" BOOLEAN DEFAULT 'false',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE ("name", "path"),
    PRIMARY KEY ("id")
);
