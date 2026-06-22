import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Empleado } from './empleado.entity';
import { Sesion } from './sesion.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre_usuario', unique: true })
  nombreUsuario: string;

  @Column({ name: 'password' })
  password: string;

  @ManyToOne(() => Empleado, (e) => e.usuarios, { eager: true })
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @OneToMany(() => Sesion, (s) => s.usuario)
  sesiones: Sesion[];

  obtenerEmpleado(): Empleado {
    return this.empleado;
  }
}
