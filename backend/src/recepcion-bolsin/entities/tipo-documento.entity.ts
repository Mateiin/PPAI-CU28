import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Documentacion } from './documentacion.entity';

@Entity('tipo_documento')
export class TipoDocumento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre' })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', nullable: true })
  descripcion: string;

  @OneToMany(() => Documentacion, (doc) => doc.tipoDocumento)
  documentaciones: Documentacion[];

  //29.getNombre()
  getNombre(): string {
    return this.nombre;
  }
}
