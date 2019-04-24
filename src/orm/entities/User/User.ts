import { Column, Entity, PrimaryGeneratedColumn, Unique, CreateDateColumn, OneToOne, JoinTable, JoinColumn } from 'typeorm';
import { Role  as UserRole } from './Role';

@Entity('users', { schema: 'user' })
@Unique(['login', 'password'])

export class User {

    @PrimaryGeneratedColumn()
    readonly id: number;

    @Column({ length: 255, name: 'login', nullable: false })
    login: string;

    @Column({ length: 255, name: 'password', nullable: false })
    password: string;

    @Column({ default: false, name: 'is_deleted', nullable: false })
    isDeleted: boolean;

    @Column({ default: false, name: 'is_banned', nullable: false })
    isBanned: boolean;

    @CreateDateColumn({ name: 'registration_date', type: 'timestamp', nullable: false })
    readonly registrationDate: Date;

    @OneToOne(type => UserRole, role => role.id, { cascade: true, nullable: false })
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role?: UserRole;

    @Column({ name: 'role_id' })
    roleId: number;
}