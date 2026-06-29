import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Empleado } from './empleado.entity';
import { Sesion } from './sesion.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre_usuario', unique: true })
  nombreUsuario: string;

  @Column({ name: 'password' })
  hashPassword: string;

  @OneToOne(() => Empleado, (e) => e.usuario, { eager: true })
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  @OneToMany(() => Sesion, (s) => s.usuario)
  sesiones: Sesion[];

  //6.obtenerEmpleado()
  obtenerEmpleado(): Empleado {
    return this.empleado;
  }
}
