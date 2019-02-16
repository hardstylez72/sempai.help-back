const _ = require('lodash');
const buildTree = require('../../../../helpers/buildTreeFromFileSystem').buildTree;

module.exports = async (data, ctx) => {
    const { logger } = ctx;
    try {
        logger.info(`Осуществляется считывание каталога файлов по адресу: ${process.env.CONTENT_PATH}`);
        const actualContent = [];
        let tree = await buildTree(process.env.CONTENT_PATH, null, track => {
            actualContent.push(track);
            return track;
        });
        logger.info(`Cчитывание каталога файлов по адресу: ${process.env.CONTENT_PATH} прошло успешно`);
        tree.toggled = true;
        await updateContent(actualContent, ctx);

    } catch (err) {
        logger.error(`Произошла ошибка при считывании каталога файлов: ${err.message}`);
        throw err;
    }
};

const updateContent = async (actualContent, ctx) => {
    const { logger, seq } = ctx;

    actualContent = actualContent.map(el => {
       return {
           name: el.name,
           path: el.fullPath,
           parent: el.parentPath,
           depth: el.depth,
           isDirectory: el.isDirectory,
           userId: 1
       }
    });
    logger.info(`Начинается обновление каталога файлов, количество новых фалов: ${actualContent.length}`);


 await seq.query(`
   begin;

create temp table tmp(
                     "name"        varchar(2048)
					, path_depth   integer
					, is_directory bool
					, "path"       varchar(2048)
					, parent_path  varchar(2048)
					, user_id      integer
					, is_deleted   bool
				    , "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL 
				    , "updatedAt"  TIMESTAMP WITH TIME ZONE NOT null
				    ) on commit drop;

insert into tmp 
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
	           from json_array_elements('${JSON.stringify(actualContent).replace(/'/g, "\'\'")}')
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
		           from tmp
		           on conflict do nothing;

commit; `);
};

