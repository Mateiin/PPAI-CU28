import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('sesion')
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fecha_inicio', type: 'timestamp' })
  fechaHoraInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamp', nullable: true })
  fechaHoraFin: Date | null;

  @ManyToOne(() => Usuario, (u) => u.sesiones, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  estaActiva(): boolean {
    return this.fechaHoraFin === null;
  }

  buscarUsuarioLogueado(): Usuario | null {
    if (!this.estaActiva()) return null;
    return this.usuario ?? null;
  }
}
