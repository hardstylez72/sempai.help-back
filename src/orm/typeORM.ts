import * as typeorm from 'typeorm';
import { config } from 'src/config/index';
const { orm } = config;
import { User } from './entities/User/User';
import { Role as UserRole, rolesList, RolesIds } from './entities/User/Role';
import { Session } from './entities/User/Session';
import { SessionIp } from './entities/User/SessionIp';

import { Users1556116394043 } from './migrations/Users1556116394043';

const connectionOptions: typeorm.ConnectionOptions = {
    // @ts-ignore: can't make type conversion
    type: orm.type,
    host: orm.host,
    port: orm.port,
    username: orm.username,
    password: orm.password,
    database: orm.database,
    migrationsRun: orm.migrationsRun,
    entities: [
        User,
        UserRole,
        Session,
        SessionIp,
    ],
    migrations: [
        Users1556116394043,
    ],
    // synchronize: true,
    logging: true,
};

/**
 * All typeorm settings locates in .env and starts with "TYPEORM_"
 * @returns {Promise<void>}
 */
const init = async () => {
    const connectionOptionsDefault = await typeorm.getConnectionOptions();
    Object.assign(connectionOptionsDefault, connectionOptions);
    const connection = await typeorm.createConnection(connectionOptions);

    const queryRunner = connection.createQueryRunner();
    await queryRunner.createSchema('user', true);

    await connection.synchronize();

    const roleRepository = connection.getRepository(UserRole);
    await roleRepository.save(rolesList);

    const photoRepository = connection.getRepository(User);
    const user1 = new User();
    user1.login = '4223325h34343336';
    user1.isDeleted = false;
    user1.password = '32532';
    user1.isBanned = false;
    user1.roleId = RolesIds.COMMON_USER;

    const users: [User] = [
        user1,
    ];
    // const savedPhotos = await photoRepository.save(users);
    console.log('gre');
};

export = { init };
