import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum AmbitoEstado {
  BOLSIN = 'Bolsin',
  REMITO = 'Remito',
  DOCUMENTACION = 'Documentacion',
}

@Entity('estado')
export class Estado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre' })
  nombre: string;

  @Column({ name: 'descripcion', type: 'varchar', nullable: true })
  descripcion: string;

  @Column({ name: 'ambito', type: 'varchar' })
  ambito: AmbitoEstado;

  esEnviado(): boolean {
    return this.nombre === 'EnBolsinEnviado';
  }

  esAmbitoBolsin(): boolean {
    return this.ambito === AmbitoEstado.BOLSIN;
  }

  esRecibidoEnCMDestino(): boolean {
    return this.nombre === 'RecibidoEnCMDestino';
  }

  esAmbitoRemito(): boolean {
    return this.ambito === AmbitoEstado.REMITO;
  }

  esRecibidoYAceptado(): boolean {
    return this.nombre === 'RecibidoYAceptado';
  }

  esAmbitoDocumentacion(): boolean {
    return this.ambito === AmbitoEstado.DOCUMENTACION;
  }

  esRecibidaYAceptada(): boolean {
    return this.nombre === 'RecibidaYAceptada';
  }
}
