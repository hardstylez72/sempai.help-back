import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Session } from './Session';

@Entity('sessionIps', { schema: 'user' })

export class SessionIp {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'cidr', name: 'ip', nullable: true })
    ip: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', nullable: false })
    readonly createdAt: Date;

    @ManyToOne(type => Session, session => session.id, { cascade: true, nullable: false })
    @JoinColumn({ name: 'session_id', referencedColumnName: 'id' })
    session?: Session;

    @Column({ name: 'session_id' })
    sessionId: number;
}
