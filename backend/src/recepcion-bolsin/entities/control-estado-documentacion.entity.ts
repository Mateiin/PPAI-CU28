import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Documentacion } from './documentacion.entity';
import { Estado } from './estado.entity';

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

  @ManyToOne(() => Documentacion, (d) => d.cEstadosDocumento)
  @JoinColumn({ name: 'documentacion_id' })
  documentacion: Documentacion;

  sosUltimo(): boolean {
    return this.fechaHoraFin === null;
  }

  setFechaHoraFin(fecha: Date): void {
    this.fechaHoraFin = fecha;
  }
}

// Alias para compatibilidad con imports existentes
export { CambioEstadoDocumentacion as ControlEstadoDocumentacion };
