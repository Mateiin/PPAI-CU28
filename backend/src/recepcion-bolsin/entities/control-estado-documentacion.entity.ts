import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Documentacion } from './documentacion.entity';
import { Estado } from './estado.entity';
import { Empleado } from './empleado.entity';

@Entity('cambio_estado_documentacion')
export class CambioEstadoDocumentacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fecha_hora_inicio', type: 'timestamp' })
  fechaHoraInicio: Date;

  @Column({ name: 'fecha_hora_fin', type: 'timestamp', nullable: true })
  fechaHoraFin: Date | null;

  @ManyToOne(() => Estado, { eager: true })
  @JoinColumn({ name: 'estado_id' })
  estado: Estado;

  @ManyToOne(() => Empleado, { nullable: true, eager: true })
  @JoinColumn({ name: 'responsable_ce_id' })
  responsableCE: Empleado | null;

  @ManyToOne(() => Documentacion, (d) => d.cEstadosDocumento)
  @JoinColumn({ name: 'documentacion_id' })
  documentacion: Documentacion;

  //60. new()
  static new(
    estado: Estado,
    fechaHoraInicio: Date,
    documentacion: Documentacion,
    responsableCE: Empleado | null = null,
  ): CambioEstadoDocumentacion {
    const cambioEstado = new CambioEstadoDocumentacion();
    cambioEstado.estado = estado;
    cambioEstado.fechaHoraInicio = fechaHoraInicio;
    cambioEstado.fechaHoraFin = null;
    cambioEstado.documentacion = documentacion;
    cambioEstado.responsableCE = responsableCE;
    return cambioEstado;
  }

  // 57.sosUltimo()
  sosUltimo(): boolean {
    return this.fechaHoraFin === null;
  }

  // 58.setFechaYHoraFin()
  setFechaYHoraFin(fecha: Date): void {
    this.fechaHoraFin = fecha;
  }
}

// Alias para compatibilidad con imports existentes
export { CambioEstadoDocumentacion as ControlEstadoDocumentacion };
