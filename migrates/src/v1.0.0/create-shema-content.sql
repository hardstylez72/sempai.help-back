--liquibase formatted sql
--changeset hardstylez72:tracks.create-schema-content endDelimiter:go runOnChange:true

create schema if not exists "content";
