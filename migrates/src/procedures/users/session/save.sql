--liquibase formatted sql
--changeset hardstylez72:tracks.create-function-users.session_save endDelimiter:go runOnChange:true

create or replace function users.session_save(user_id integer, "session" uuid, ip cidr)
returns void as $$
begin
    insert into users.sessions (user_id, "session", ip, created_at)
    values (user_id, "session", ip, now()) on conflict do nothing;
end;
$$ language plpgsql;

