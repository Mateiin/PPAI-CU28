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

  // 28.getAsunto()
  getAsunto(): string | null {
    return this.asunto;
  }

  //59.crearCEDoc()
  crearCEDoc(estado: Estado, fechaHoraInicio: Date, empleado: Empleado): CambioEstadoDocumentacion {
    if (!this.cEstadosDocumento) {
    this.cEstadosDocumento = []; // Inicializar si viene undefined
  }
    const nuevo = new CambioEstadoDocumentacion();
    nuevo.fechaHoraInicio = fechaHoraInicio;
    nuevo.fechaHoraFin = null;
    nuevo.estado = estado;
    nuevo.responsableCE = empleado;
    nuevo.documentacion = this;
    this.cEstadosDocumento.push(nuevo);
    return nuevo;
  }

  //Métodos de Máquina de Estados (Clase Documentacion)

  //56.aceptarDoc()
  aceptarDoc(estado: Estado, empleado: Empleado): void {
  this.detallesRemito.forEach(dr => dr.actualizarEstadoDoc(estado, empleado)); 
  }

  rechazarDoc(estado: Estado, empleado: Empleado): void {
    this.detallesRemito.forEach(dr => dr.actualizarEstadoDoc(estado, empleado));
  }

  registrarFaltante(estado: Estado, empleado: Empleado): void {
    this.detallesRemito.forEach(dr => dr.actualizarEstadoDoc(estado, empleado));
  }

  redirigirDocumentacion(estado: Estado, empleado: Empleado): void {
    this.detallesRemito.forEach(dr => dr.actualizarEstadoDoc(estado, empleado));
  }
}
