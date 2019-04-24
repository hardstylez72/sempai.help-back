--liquibase formatted sql
--changeset hardstylez72:tracks.create-table-content.notes endDelimiter:go runOnChange:true

create table if not exists "content".notes (
  "id" serial unique,
  "url" varchar(1000) not null,
  "description" varchar(4000) not null,
  "user_id" integer not null,
  "abstract" varchar(200) not null,
  "is_deleted" boolean default 'false',
  "created_at" timestamp with time zone not null,
  "updateda_t" timestamp with time zone not null,
  primary key ("id")
);

