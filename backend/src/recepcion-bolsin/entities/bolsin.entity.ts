import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { Remito } from './remito.entity';
import { Empleado } from './empleado.entity';
import { ComisionMedica } from './comision-medica.entity';
import { CambioEstadoBolsin } from './control-estado-bolsin.entity';
import { Estado } from './estado.entity';

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
  @JoinColumn({ name: 'cm_destino_id' })
  cmDestino: ComisionMedica | null;

  @ManyToOne(() => ComisionMedica, { nullable: true, eager: true })
  @JoinColumn({ name: 'cm_origen_id' })
  cmOrigen: ComisionMedica | null;

  @ManyToOne(() => Empleado, { nullable: true, eager: true })
  @JoinColumn({ name: 'empleado_responsable_id' })
  empleadoResponsable: Empleado | null;

  @OneToMany(() => Remito, (r) => r.bolsin, { eager: true })
  remitos: Remito[];

  @OneToMany(() => CambioEstadoBolsin, (c) => c.bolsin, { cascade: true, eager: true })
  cEstadosBolsin: CambioEstadoBolsin[];

  // ── Métodos de dominio ──────────────────────────────────────────────────

  getCambioEstadoActual(): CambioEstadoBolsin | null {
    if (!this.cEstadosBolsin?.length) return null;
    return this.cEstadosBolsin.reduce((prev, curr) =>
      curr.fechaHoraInicio > prev.fechaHoraInicio ? curr : prev,
    );
  }

  sosEnviado(): boolean {
    return this.getCambioEstadoActual()?.sosEnviado() ?? false;
  }

  esTuCMDestino(cm: ComisionMedica): boolean {
    return this.cmDestino?.id === cm.id;
  }

  getCMOrigen(): ComisionMedica | null {
    return this.cmOrigen;
  }

  getNroPrecinto(): string | null {
    return this.nroPrecinto;
  }

  obtenerInformacionRemito(): Remito[] {
    return this.remitos;
  }

  actualizarCEBolsin(estado: Estado, fecha: Date): void {
    const actual = this.getCambioEstadoActual();
    if (actual && actual.sosUltimo()) {
      actual.setFechaHoraFin(fecha);
    }
    this.crearCEBolsin(fecha, estado);
  }

  registrarRecepcion(estado: Estado, fecha: Date): void {
    this.actualizarCEBolsin(estado, fecha);
  }

  crearCEBolsin(fechaHoraInicio: Date, estado: Estado): CambioEstadoBolsin {
    const nuevo = new CambioEstadoBolsin();
    nuevo.fechaHoraInicio = fechaHoraInicio;
    nuevo.fechaHoraFin = null;
    nuevo.estado = estado;
    nuevo.bolsin = this;
    this.cEstadosBolsin.push(nuevo);
    return nuevo;
  }
}
