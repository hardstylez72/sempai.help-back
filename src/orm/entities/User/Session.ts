import { Column, Entity, PrimaryGeneratedColumn, Unique, CreateDateColumn, OneToOne, JoinTable, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('sessions', { schema: 'user' })
@Unique(['session'])

export class Session {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'uuid', name: 'session', nullable: false })
    session: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', nullable: false })
    readonly createdAt: Date;

    @OneToOne(type => User, user => user.id, { cascade: true, nullable: false })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: number;

}