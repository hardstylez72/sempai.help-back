--liquibase formatted sql
--changeset hardstylez72:tracks.create-table-users endDelimiter:go runOnChange:true


create table if not exists "users"."users" (
    "id"          serial unique
  , "login"       varchar(40) not null
  , "password"    varchar(40) not null
  , "role_id"     integer not null
  , "is_deleted"  boolean default 'false'
  , "is_banned"   boolean default 'false'
  , "created_at"  timestamp with time zone not null
  , "updated_at"  timestamp with time zone not null
  , unique ("login", "password")
  , primary key ("id")
);

insert into "users"."users" ("id","login","password","role_id","is_deleted","created_at","updated_at") values (default,'1','1',1,false,'2019-03-03 10:53:00.818 +00:00','2019-03-03 10:53:00.818 +00:00')