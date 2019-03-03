--liquibase formatted sql
--changeset hardstylez72:tracks.create-table-users.sessions endDelimiter:go runOnChange:true


create table if not exists users."sessions" (
    "user_id"     integer not null references "users"."users" ("id") on delete no action on update cascade
  , "session"     uuid not null
  , "ip"          cidr not null
  , "created_at"  timestamp with time zone not null
  , unique ("user_id", "session")
);