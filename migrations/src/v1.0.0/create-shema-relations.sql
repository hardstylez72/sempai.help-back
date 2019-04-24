--liquibase formatted sql
--changeset hardstylez72:tracks.create-schema-relations endDelimiter:go runOnChange:true

create schema if not exists "relations";
