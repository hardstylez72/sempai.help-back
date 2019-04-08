const getPathName = req => req.body.data;

const getRootFolderContent = async ctx => {
    const { db, } = ctx;
    const files = await db.query(`
            select t.name
                 , t.parent_path as parent
                 , t.path
                 , t.is_directory as "isDirectory"
                 , t.path_depth as depth
              from content.tracks t
             where t.path_depth = 1
               and t.is_deleted <> true;`);

    const rows = files.rows.map(row => {
        if (row.isDirectory) {
            row.children = [];
        }

        return row;
    });

    return {
        toggled   : true,
        name      : 'Content',
        parentPath: null,
        root      : true,
        children  : rows,
    };
};

const getFolderContent = async (path, ctx) => {
    const { db, } = ctx;
    const files = await db.query(`
            select t.name
                 , t.parent_path as parent
                 , t.path
                 , t."is_directory" as "isDirectory"
                 , t.path_depth as depth
              from content.tracks t
             where t.parent_path = '${path}'
               and t.is_deleted <> true;`);

    const rows = files.rows.map(row => {
        if (row.isDirectory) {
            row.children = [];
        }

        return row;
    });

    return rows;
};

module.exports = async req => {
    const {ctx} = req;
    const { logger, } = ctx;

    try {
        const pathName = getPathName(req);
        let tracks = null;

        if (null === pathName) {
            tracks = await getRootFolderContent(ctx);
        } else {
            tracks = await getFolderContent(pathName, ctx);
        }

        return tracks;
    } catch (err) {
        logger.error(`Произошла ошибка при считывании каталога файлов: ${err.message}`);
        throw err;
    }
};
