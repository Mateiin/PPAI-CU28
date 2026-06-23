import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Remito } from './remito.entity';
import { Documentacion } from './documentacion.entity';
import { Estado } from './estado.entity';
import { Empleado } from './empleado.entity';

@Entity('detalle_remito')
export class DetalleRemito {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Remito, (r) => r.detallesRemito)
  @JoinColumn({ name: 'remito_id' })
  remito: Remito;

  @ManyToOne(() => Documentacion, (d) => d.detallesRemito, { eager: true })
  @JoinColumn({ name: 'documentacion_id' })
  documentacion: Documentacion;

  getDocumentacion(): Documentacion {
    return this.documentacion;
  }

  actualizarEstadoDoc(estado: Estado, empleado: Empleado): void {
    this.documentacion.actualizarEstadoDoc(estado, empleado);
  }
}
