import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { ComisionMedica } from './comision-medica.entity';

@Entity('empleado')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre' })
  nombre: string;

  @Column({ name: 'apellido' })
  apellido: string;

  @Column({ name: 'legajo', unique: true })
  legajo: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email: string | null;

  @ManyToOne(() => ComisionMedica, (cm) => cm.empleados, { nullable: true, eager: true })
  @JoinColumn({ name: 'cm_asignada_id' })
  cmAsignada: ComisionMedica | null;

  @OneToMany(() => Usuario, (u) => u.empleado)
  usuarios: Usuario[];

  getNombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }

  getCM(): ComisionMedica | null {
    return this.cmAsignada;
  }
}
