--liquibase formatted sql
--changeset hardstylez72:tracks.create-function-users.auth_validate endDelimiter:go runOnChange:true

create or replace function users.auth_validate(login_value varchar(40), password_value varchar(40))
returns boolean as $$

begin

    if not exists (select *
                     from users.users u
                    where u."login" = login_value)
                     then
                   select f_raise('EXCEPTION', 'Логин не найден');
                   return false;
    end if;

    if not exists (select *
                     from users.users u
                    where u."password" = password_value)
                     then
                   select f_raise('EXCEPTION', 'Неверный пароль');
                   return false;
    end if;

    return true;
end;
$$ language plpgsql;