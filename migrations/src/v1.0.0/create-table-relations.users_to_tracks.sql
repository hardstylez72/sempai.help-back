--liquibase formatted sql
--changeset hardstylez72:tracks.create-table-tastes endDelimiter:go runOnChange:true

create table if not exists "relations"."users_to_tracks" (
  "user_id" integer not null references "users"."users" ("id") on delete no action on update cascade,
  "track_id" integer not null references "content"."tracks" ("id") on delete no action on update cascade,
  "deleted" boolean default false,
  "createdat" timestamp with time zone not null,
  "updatedat" timestamp with time zone not null,
  primary key ("user_id", "track_id")
);
