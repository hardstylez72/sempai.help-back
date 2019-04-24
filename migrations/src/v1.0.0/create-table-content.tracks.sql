--liquibase formatted sql
--changeset hardstylez72:create-table-relations.users_to_tracks endDelimiter:go runOnChange:true

create table if not exists "content"."tracks" (
    "id" serial,
    "name" varchar(2048) not null,
    "path_depth" integer,
    "is_directory" boolean default 'false',
    "path" varchar(2048),
    "parent_path" varchar(2048),
    "user_id" integer references "users"."users" ("id") on delete set null on update cascade,
    "is_deleted" boolean default 'false',
    "created_at" timestamp with time zone not null,
    unique ("name", "path"),
    primary key ("id")
);
