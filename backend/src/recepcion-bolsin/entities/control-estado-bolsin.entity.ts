import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Empleado } from './empleado.entity';
import { Estado } from './estado.entity';
import { Bolsin } from './bolsin.entity';

@Entity('cambio_estado_bolsin')
export class CambioEstadoBolsin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fecha_hora_inicio', type: 'timestamp' })
  fechaHoraInicio: Date;

  @Column({ name: 'fecha_hora_fin', type: 'timestamp', nullable: true })
  fechaHoraFin: Date | null;

  @Column({ name: 'log_empleado', type: 'varchar', nullable: true })
  logEmpleado: string;

  @ManyToOne(() => Estado, { eager: true })
  @JoinColumn({ name: 'estado_id' })
  estado: Estado;

  @ManyToOne(() => Empleado, { nullable: true, eager: true })
  @JoinColumn({ name: 'responsable_ce_id' })
  responsableCE: Empleado | null;

  @ManyToOne(() => Bolsin, (b) => b.cEstadosBolsin)
  @JoinColumn({ name: 'bolsin_id' })
  bolsin: Bolsin;

  sosUltimo(): boolean {
    return this.fechaHoraFin === null;
  }

  setFechaHoraFin(fecha: Date): void {
    this.fechaHoraFin = fecha;
  }

  sosEnviado(): boolean {
    return this.estado?.esEnviado() ?? false;
  }
}

// Alias para compatibilidad con imports existentes
export { CambioEstadoBolsin as ControlEstadoBolsin };
