import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Empleado } from './empleado.entity';

@Entity('comision_medica')
export class ComisionMedica {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre' })
  nombre: string;

  @Column({ name: 'codigo', unique: true })
  codigo: string;

  @Column({ name: 'email', type: 'varchar', nullable: true })
  email: string;

  @Column({ name: 'telefono', type: 'varchar', nullable: true })
  telefono: string;

  @OneToMany(() => Empleado, (e) => e.cmAsignada)
  empleados: Empleado[];

  getNombre(): string {
    return this.nombre;
  }
}
