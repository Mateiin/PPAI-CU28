import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
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

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email: string | null;

  @ManyToOne(() => ComisionMedica, (cm) => cm.empleados, { nullable: true, eager: true })
  @JoinColumn({ name: 'cm_asignada_id' })
  cmAsignada: ComisionMedica | null;

  @OneToOne(() => Usuario, (u) => u.empleado)
  usuario: Usuario;


  //8.getCM()
  getCM(): ComisionMedica | null {
    return this.cmAsignada;
  }
}
