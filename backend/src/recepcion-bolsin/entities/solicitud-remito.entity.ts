import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Remito } from './remito.entity';

@Entity('solicitud_remito')
export class SolicitudRemito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'numero' })
  numero: string;

  @Column({ name: 'fecha', type: 'date' })
  fecha: Date;

  @OneToMany(() => Remito, (r) => r.solicitudRemito)
  remitos: Remito[];
}
