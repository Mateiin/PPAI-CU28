import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { TipoDocumento } from './tipo-documento.entity';
import { CambioEstadoDocumentacion } from './control-estado-documentacion.entity';
import { Estado } from './estado.entity';
import { DetalleRemito } from './detalle-remito.entity';

@Entity('documentacion')
export class Documentacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'numero' })
  numero: string;

  @Column({ name: 'fecha_pase', type: 'date', nullable: true })
  fechaPase: Date | null;

  @Column({ name: 'asunto', type: 'varchar', nullable: true })
  asunto: string | null;

  @Column({ name: 'archivo', type: 'varchar', nullable: true })
  archivo: string | null;

  @ManyToOne(() => TipoDocumento, (t) => t.documentaciones, { eager: true })
  @JoinColumn({ name: 'tipo_documento_id' })
  tipoDocumento: TipoDocumento;

  @OneToMany(() => DetalleRemito, (dr) => dr.documentacion)
  detallesRemito: DetalleRemito[];

  @OneToMany(() => CambioEstadoDocumentacion, (c) => c.documentacion, {
    cascade: true,
    eager: true,
  })
  cEstadosDocumento: CambioEstadoDocumentacion[];

  // ── Métodos de dominio ──────────────────────────────────────────────────

  getAsunto(): string | null {
    return this.asunto;
  }

  getCambioEstadoActual(): CambioEstadoDocumentacion | null {
    if (!this.cEstadosDocumento?.length) return null;
    return this.cEstadosDocumento.reduce((prev, curr) =>
      curr.fechaHoraInicio > prev.fechaHoraInicio ? curr : prev,
    );
  }

  crearCEDoc(estado: Estado, fechaHoraInicio: Date): CambioEstadoDocumentacion {
    const nuevo = new CambioEstadoDocumentacion();
    nuevo.fechaHoraInicio = fechaHoraInicio;
    nuevo.fechaHoraFin = null;
    nuevo.estado = estado;
    nuevo.documentacion = this;
    this.cEstadosDocumento.push(nuevo);
    return nuevo;
  }

  actualizarEstadoDoc(estado: Estado): void {
    const ahora = new Date();
    const actual = this.getCambioEstadoActual();
    if (actual && actual.sosUltimo()) {
      actual.setFechaHoraFin(ahora);
    }
    this.crearCEDoc(estado, ahora);
  }

  aceptarDoc(estado: Estado): void {
    this.actualizarEstadoDoc(estado);
  }

  rechazarDoc(estado: Estado): void {
    this.actualizarEstadoDoc(estado);
  }

  registrarFaltante(estado: Estado): void {
    this.actualizarEstadoDoc(estado);
  }

  reenviarDoc(estado: Estado): void {
    this.actualizarEstadoDoc(estado);
  }
}
