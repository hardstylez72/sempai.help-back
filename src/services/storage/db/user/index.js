const getByCredentials = async (params, ctx) => {
    const { db, } = ctx;
    const { password, login, } = params;

    const user = await db.query(
        `select u.id
             , u."login"
             , u.role_id    as "roleId"
             , u.is_deleted as "isDeleted"
             , u.created_at as "createdAt"
             , u.updated_at as "updatedAt"
            from users.users u
            where u."password" = $1
              and u."login" = $2;
        `,
        [ password, login, ]
    );

    return user.rows[0];
};

module.exports = {
    getByCredentials
};