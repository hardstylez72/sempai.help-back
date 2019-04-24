const validate =  async (params, ctx) => {
    const { db, } = ctx;
    const { password, login, } = params;
    let isValid = false;

    if (password && login) {
        const user = await db.query(
            `select u.id
                , u."login"
                , u.role_id
                , u.is_deleted
                , u.created_at
                , u.updated_at
            from users.users u
            where u."password" = $1
              and u."login" = $2;
            `,
            [ password, login, ]
        );

        if (0 !== user.rowCount) {
            isValid = true;
        }
    }

    return isValid;
};

const saveSession =  async (params, ctx) => {
    const { db, } = ctx;
    const { sessionId, ip, userId, } = params;

    await db.query(
        `INSERT INTO users.sessions
        (user_id, "session", ip, created_at)
        VALUES($1, $2, $3, now());
        `,
        [ userId, sessionId, ip, ]
    );
};


module.exports = {
    validate,
    saveSession,
};
