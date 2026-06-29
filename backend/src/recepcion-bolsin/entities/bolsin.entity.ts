import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { Remito } from './remito.entity';
import { ComisionMedica } from './comision-medica.entity';
import { CambioEstadoBolsin } from './control-estado-bolsin.entity';
import { Estado } from './estado.entity';
import { Empleado } from './empleado.entity';

@Entity('bolsin')
export class Bolsin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nro_bolsin', unique: true })
  nroBolsin: string;

  @Column({ name: 'fecha', type: 'date' })
  fecha: Date;

  @Column({ name: 'peso', type: 'decimal', precision: 8, scale: 2, nullable: true })
  peso: number | null;

  @Column({ name: 'nro_precinto', type: 'varchar', nullable: true })
  nroPrecinto: string | null;

  @ManyToOne(() => ComisionMedica, { nullable: true, eager: true })
  @JoinColumn({ name: 'destino_id' })
  destino: ComisionMedica | null;

  @ManyToOne(() => ComisionMedica, { nullable: true, eager: true })
  @JoinColumn({ name: 'origen_id' })
  origen: ComisionMedica | null;

  @OneToMany(() => Remito, (r) => r.bolsin, { eager: true })
  remitos: Remito[];

  @OneToMany(() => CambioEstadoBolsin, (c) => c.bolsin, { cascade: true, eager: true })
  cEstadosBolsin: CambioEstadoBolsin[];

  // ── Métodos de dominio ──────────────────────────────────────────────────

  // 49.getCambioEstadoActual()
  getCambioEstadoActual(): CambioEstadoBolsin | null {
    if (!this.cEstadosBolsin?.length) return null;
    return this.cEstadosBolsin.reduce((prev, curr) =>
      curr.fechaHoraInicio > prev.fechaHoraInicio ? curr : prev,
    );
  }
  // 12.sosEnviado()
  sosEnviado(): boolean {
    return this.getCambioEstadoActual()?.sosEnviado() ?? false;
  }

  // 16.esTuCMDestino()
  esTuCMDestino(cm: ComisionMedica): boolean {
    return this.destino?.id === cm.id;
  }

  // 17.getCMOrigen()
  getCMOrigen(): ComisionMedica | null {
    return this.origen;
  }

  //18.getNroPrecinto()
  getNroPrecinto(): string | null {
    return this.nroPrecinto;
  }

  //24.obtenerInformacionRemito()
  obtenerInformacionRemito(): Remito[] {
    return this.remitos;
  }

  //51.crearCEBolsin()
 crearCEBolsin(fecha: Date, estado: Estado, empleado: Empleado): void {
  if (!this.cEstadosBolsin) {
    this.cEstadosBolsin = [];
  }
  const actual = this.getCambioEstadoActual();
  if (actual && actual.sosUltimo()) {
    actual.setFechaHoraFin(fecha);
  }

  //52.new()
  const nuevo = new CambioEstadoBolsin();
  nuevo.fechaHoraInicio = fecha;
  nuevo.fechaHoraFin = null;
  nuevo.estado = estado;
  nuevo.bolsin = this;
  nuevo.responsableCE = empleado;
  this.cEstadosBolsin.push(nuevo);
}

  // 49.registrarRecepcion()
  registrarRecepcion(estado: Estado, fechaHoraActual: Date, empleado: Empleado): void {
    this.crearCEBolsin(fechaHoraActual, estado, empleado);
  }

  
}
