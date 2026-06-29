import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Remito } from './remito.entity';
import { Documentacion } from './documentacion.entity';
import { Estado } from './estado.entity';
import { Empleado } from './empleado.entity';

@Entity('detalle_remito')
export class DetalleRemito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre',  type: 'varchar'})
  nombre: string;

  @ManyToOne(() => Remito, (r) => r.detallesRemito)
  @JoinColumn({ name: 'remito_id' })
  remito: Remito;

  @ManyToOne(() => Documentacion, (d) => d.detallesRemito, { eager: true })
  @JoinColumn({ name: 'documentacion_id' })
  documentacion: Documentacion;

  // 27.getDocumentacion()
  getDocumentacion(): Documentacion {
    return this.documentacion;
  }

  // 55.actualizarEstadoDoc()
  actualizarEstadoDoc(estado: Estado, empleado: Empleado): void {
      const ahora = new Date();
      this.documentacion.crearCEDoc(estado, ahora, empleado);
    }
}
