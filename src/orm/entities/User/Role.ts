import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

/**
 * Types of roles corresponds to id
 */
export enum RolesIds {
    'ADMIN' = 1,
    'COMMON_USER' = 2,
    'USER_WITH_LIMITED_RIGHTS' = 3,
}

/**
 * List of types of roles
 */
export enum Roles {
    'ADMIN' = 'ADMIN',
    'COMMON_USER' = 'COMMON_USER',
    'USER_WITH_LIMITED_RIGHTS' = 'USER_WITH_LIMITED_RIGHTS',
}

@Entity('roles', { schema: 'user' })
@Unique(['code'])

export class Role {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 1024, name: 'code', nullable: true })
    code: string;

    @Column({ length: 1024, name: 'description', nullable: true })
    description?: string;

    @Column({ default: true, name: 'is_active', nullable: false })
    isActive?: boolean;
}

const adminRole = new Role();
adminRole.id = RolesIds.ADMIN;
adminRole.description =  'allowed everything';
adminRole.code = Roles.ADMIN;

const userWithLimitedLightsRole = new Role();
userWithLimitedLightsRole.id = RolesIds.USER_WITH_LIMITED_RIGHTS;
userWithLimitedLightsRole.description =  'allowed only to see a small part of content';
userWithLimitedLightsRole.code = Roles.USER_WITH_LIMITED_RIGHTS;

const commonUserRole = new Role();
commonUserRole.id = RolesIds.COMMON_USER;
commonUserRole.description =  'allowed only to see a small part of content';
commonUserRole.code = Roles.COMMON_USER;

const rolesList: Role[] = [
    adminRole,
    userWithLimitedLightsRole,
    commonUserRole,
];

export { rolesList };
