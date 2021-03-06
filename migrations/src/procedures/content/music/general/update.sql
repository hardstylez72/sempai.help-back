--liquibase formatted sql
--changeset hardstylez72:tracks.get_music_catalog_list endDelimiter:go runOnChange:true

create or replace function "content".get_music_catalog_list(data json)
 returns void
 language plpgsql
as $function$
begin
create temp table tmp_tracks(
                     "name"        varchar(2048)
					, path_depth   integer
					, is_directory bool
					, "path"       varchar(2048)
					, parent_path  varchar(2048)
					, user_id      integer
					, is_deleted   bool
				    , "created_at" timestamp with time zone not null
				    ) on commit drop;

insert into tmp_tracks
	 select value ->> 'name'                             as "name"
	 	  , (select (value::json ->>'depth')::integer    as path_depth)
	 	  , (select (value::json ->>'isDirectory')::bool as is_directory)
	      , value ->> 'path'                             as "path"
	      , value ->> 'parent'                           as parent_path
	      , (select (value::json ->>'userId')::integer   as user_id)
	      , false                                        as is_deleted
	      , now()                                        as "created_at"
	   from (select *
	           from json_array_elements(data)
) as buf;

insert into "content".tracks (
                           "name"
						  , path_depth
						  , is_directory
		           		  ,"path"
		           		  , parent_path
		           		  , user_id
		           		  , is_deleted
		           		  , created_at)
 				     select "name"
 				 		  , path_depth
 				 		  , is_directory
		           		  , "path"
		           		  , parent_path
		           		  , user_id
		           		  , is_deleted
		           		  , created_at
		           from tmp_tracks
		           on conflict do nothing;
end;
$function$;
