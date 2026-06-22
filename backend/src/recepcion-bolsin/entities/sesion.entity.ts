import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('sesion')
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fecha_inicio', type: 'timestamp' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamp', nullable: true })
  fechaFin: Date | null;

  @ManyToOne(() => Usuario, (u) => u.sesiones, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  estaActiva(): boolean {
    return this.fechaFin === null;
  }

  static buscarUsuarioLogueado(sesiones: Sesion[]): Usuario | null {
    const activa = sesiones.find((s) => s.estaActiva());
    return activa ? activa.usuario : null;
  }
}
