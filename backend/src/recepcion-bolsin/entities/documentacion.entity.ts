import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { TipoDocumento } from './tipo-documento.entity';
import { CambioEstadoDocumentacion } from './control-estado-documentacion.entity';
import { Estado } from './estado.entity';
import { DetalleRemito } from './detalle-remito.entity';
import { Empleado } from './empleado.entity';

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

  crearCEDoc(estado: Estado, fechaHoraInicio: Date, empleado: Empleado): CambioEstadoDocumentacion {
    const nuevo = new CambioEstadoDocumentacion();
    nuevo.fechaHoraInicio = fechaHoraInicio;
    nuevo.fechaHoraFin = null;
    nuevo.estado = estado;
    nuevo.logEmpleado = empleado.getNombreCompleto();
    nuevo.responsableCE = empleado;
    nuevo.documentacion = this;
    this.cEstadosDocumento.push(nuevo);
    return nuevo;
  }

  actualizarEstadoDoc(estado: Estado, empleado: Empleado): void {
    const ahora = new Date();
    const actual = this.getCambioEstadoActual();
    if (actual && actual.sosUltimo()) {
      actual.setFechaHoraFin(ahora);
    }
    this.crearCEDoc(estado, ahora, empleado);
  }

  aceptarDoc(estado: Estado, empleado: Empleado): void {
    this.actualizarEstadoDoc(estado, empleado);
  }

  rechazarDoc(estado: Estado, empleado: Empleado): void {
    this.actualizarEstadoDoc(estado, empleado);
  }

  registrarFaltante(estado: Estado, empleado: Empleado): void {
    this.actualizarEstadoDoc(estado, empleado);
  }

  redirigirDocumentacion(estado: Estado, empleado: Empleado): void {
    this.actualizarEstadoDoc(estado, empleado);
  }
}
