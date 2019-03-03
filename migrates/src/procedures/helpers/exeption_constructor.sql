--liquibase formatted sql
--changeset hardstylez72:tracks.create-function-users.auth_validate endDelimiter:go runOnChange:true

CREATE OR REPLACE FUNCTION f_raise(_lvl text = 'EXCEPTION'
                                  ,_msg text = 'Default error msg.')
  RETURNS void AS
$func$
BEGIN
   CASE upper(_lvl)
      WHEN 'EXCEPTION' THEN RAISE EXCEPTION '%', _msg;
      WHEN 'WARNING'   THEN RAISE WARNING   '%', _msg;
      WHEN 'NOTICE'    THEN RAISE NOTICE    '%', _msg;
      WHEN 'DEBUG'     THEN RAISE DEBUG     '%', _msg;
      WHEN 'LOG'       THEN RAISE LOG       '%', _msg;
      WHEN 'INFO'      THEN RAISE INFO      '%', _msg;
      ELSE RAISE EXCEPTION 'f_raise(): unexpected raise-level: "%"', _lvl;
   END CASE;
END
$func$  LANGUAGE plpgsql STRICT;