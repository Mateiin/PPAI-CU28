import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { DetalleRemito } from './detalle-remito.entity';
import { SolicitudRemito } from './solicitud-remito.entity';
import { Bolsin } from './bolsin.entity';
import { Estado } from './estado.entity';
import { CambioEstadoRemito } from './control-estado-remito.entity';

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

  @OneToMany(() => CambioEstadoRemito, (c) => c.remito, { cascade: true, eager: true })
  cEstadosRemito: CambioEstadoRemito[];

  getNumero(): string {
    return this.numero;
  }

  tomarDocumentacion(): DetalleRemito[] {
    return this.detallesRemito;
  }

  getCambioEstadoActual(): CambioEstadoRemito | null {
    if (!this.cEstadosRemito?.length) return null;
    return this.cEstadosRemito.reduce((prev, curr) =>
      curr.fechaHoraInicio > prev.fechaHoraInicio ? curr : prev,
    );
  }

  recibirRemito(estado: Estado, fecha: Date): void {
    const actual = this.getCambioEstadoActual();
    if (actual && actual.sosUltimo()) {
      actual.setFechaHoraFin(fecha);
    }
    const nuevo = new CambioEstadoRemito();
    nuevo.fechaHoraInicio = fecha;
    nuevo.fechaHoraFin = null;
    nuevo.estado = estado;
    nuevo.remito = this;
    this.cEstadosRemito.push(nuevo);
  }
}
