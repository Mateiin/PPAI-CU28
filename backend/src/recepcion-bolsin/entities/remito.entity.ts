import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, OneToOne, ManyToOne, JoinColumn,
} from 'typeorm';
import { DetalleRemito } from './detalle-remito.entity';
import { Bolsin } from './bolsin.entity';
import { Estado } from './estado.entity';

@Entity('remito')
export class Remito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'numero', unique: true })
  numero: string;

  @Column({ name: 'fecha', type: 'date' })
  fecha: Date;

  @ManyToOne(() => Estado, { nullable: true, eager: true })
  @JoinColumn({ name: 'estado_id' })
  estado: Estado | null;

  @ManyToOne(() => Bolsin, (b) => b.remitos, { nullable: true })
  @JoinColumn({ name: 'bolsin_id' })
  bolsin: Bolsin | null;

  @OneToMany(() => DetalleRemito, (d) => d.remito, { cascade: true, eager: true })
  detallesRemito: DetalleRemito[];

  // 25.getNumero()
  getNumero(): string {
    return this.numero;
  }

  // 26.tomarDocumentacion()
  tomarDocumentacion(): DetalleRemito[] {
    return this.detallesRemito;
  }

  // 53.recibirRemito()
  recibirRemito(estado: Estado, fecha: Date): void {
    this.setEstado(estado);
    // Llamamos al método 54.setEstado() para actualizar el estado del remito.
  }

  // 54.setEstado()
  setEstado(estado: Estado): void {
    this.estado = estado;
  }
}
