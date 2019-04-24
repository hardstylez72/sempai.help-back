--liquibase formatted sql
--changeset hardstylez72:tracks.create-schema-users endDelimiter:go runOnChange:true

create schema if not exists "users";
