module.exports = async (req, ctx) => {
    const { logger, seq } = ctx;
    try {
        const pathName = getPathName(req);
        let data = null;

        if (pathName === null) {
            data = await getRootFolderContent(seq);
        } else {
            data = await getFolderContent(seq, pathName);
        }
        return data;
    } catch (err) {
        logger.error(`Произошла ошибка при считывании каталога файлов: ${err.message}`);
        throw err;
    }
};

const getPathName = req => {
    return req.body.data;
};

const getRootFolderContent = async seq => {
    const data = await seq.query(`
            select t.name
                 , t.parent_path as parent
                 , t.path
                 , t."is_directory" as "isDirectory"
                 , t.path_depth as depth
              from tracks.tracks t
             where t.path_depth = 1
               and t.is_deleted <> true;`);

    const rows = data[0].map(row => {
        if (row.isDirectory) {
            row.children = [];
        }
        return row;
    });

    return {
        toggled: true,
        name: 'Content',
        parentPath: null,
        root: true,
        children: rows,
    };
};

const getFolderContent = async (seq, path) => {
    const data = await seq.query(`
            select t.name
                 , t.parent_path as parent
                 , t.path
                 , t."is_directory" as "isDirectory"
                 , t.path_depth as depth
              from tracks.tracks t
             where t.parent_path = '${path}'
               and t.is_deleted <> true;`);

    const rows = data[0].map(row => {
        if (row.isDirectory) {
            row.children = [];
        }
        return row;
    });

    return rows;
};
