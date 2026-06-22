import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { DetalleRemito } from './detalle-remito.entity';
import { SolicitudRemito } from './solicitud-remito.entity';
import { Bolsin } from './bolsin.entity';
import { Estado } from './estado.entity';

@Entity('remito')
export class Remito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'numero', unique: true })
  numero: string;

  @Column({ name: 'fecha', type: 'date' })
  fecha: Date;

  @ManyToOne(() => SolicitudRemito, (sr) => sr.remitos, { nullable: true, eager: true })
  @JoinColumn({ name: 'solicitud_remito_id' })
  solicitudRemito: SolicitudRemito | null;

  @ManyToOne(() => Bolsin, (b) => b.remitos, { nullable: true })
  @JoinColumn({ name: 'bolsin_id' })
  bolsin: Bolsin | null;

  @OneToMany(() => DetalleRemito, (d) => d.remito, { cascade: true, eager: true })
  detallesRemito: DetalleRemito[];

  estado: Estado | null = null;

  getNumero(): string {
    return this.numero;
  }

  tomarDocumentacion(): DetalleRemito[] {
    return this.detallesRemito;
  }

  recibirRemito(): void {
    // transición de estado del remito al ser recibido (CU28)
  }

  setEstado(estado: Estado): void {
    this.estado = estado;
  }
}
