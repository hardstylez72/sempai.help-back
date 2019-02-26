CREATE OR REPLACE PROCEDURE musicCatalog_list(data json)
LANGUAGE SQL
AS $$
begin

create temp table tmp_tracks( "name"        varchar(2048)
					, path_depth   integer
					, is_directory bool
					, "path"       varchar(2048)
					, parent_path  varchar(2048)
					, user_id      integer
					, is_deleted   bool
				    , "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL
				    , "updatedAt"  TIMESTAMP WITH TIME ZONE NOT null
				    ) on commit drop;

insert into tmp_tracks
	 select value ->> 'name'        as name
	 	  , (select (value::json ->>'depth')::integer  as path_depth)
	 	  , (select (value::json ->>'isDirectory')::bool  as is_directory)
	      , value ->> 'path'        as path
	      , value ->> 'parent'      as parent_path
	      , (select (value::json ->>'userId')::integer  as user_id)
	      , false as is_deleted
	      , now() as "createdAt"
	      , now() as "updatedAt"
	   from (select *
	           from json_array_elements(data)
) as buf;

insert into tracks.tracks ("name"
						  , path_depth
						  , is_directory
		           		  ,"path"
		           		  , parent_path
		           		  , user_id
		           		  , is_deleted
		           		  , "createdAt"
		           		  , "updatedAt")
 				     select "name"
 				 		  , path_depth
 				 		  , is_directory
		           		  , "path"
		           		  , parent_path
		           		  , user_id
		           		  , is_deleted
		           		  , "createdAt"
		           		  , "updatedAt"
		           from tmp_tracks
		           on conflict do nothing;

commit;
end $$;

