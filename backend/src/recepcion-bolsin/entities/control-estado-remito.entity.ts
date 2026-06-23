import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Estado } from './estado.entity';
import { Remito } from './remito.entity';

@Entity('cambio_estado_remito')
export class CambioEstadoRemito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fecha_hora_inicio', type: 'timestamp' })
  fechaHoraInicio: Date;

  @Column({ name: 'fecha_hora_fin', type: 'timestamp', nullable: true })
  fechaHoraFin: Date | null;

  @ManyToOne(() => Estado, { eager: true })
  @JoinColumn({ name: 'estado_id' })
  estado: Estado;

  @ManyToOne(() => Remito, (r) => r.cEstadosRemito)
  @JoinColumn({ name: 'remito_id' })
  remito: Remito;

  sosUltimo(): boolean {
    return this.fechaHoraFin === null;
  }

  setFechaHoraFin(fecha: Date): void {
    this.fechaHoraFin = fecha;
  }
}
