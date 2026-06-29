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


  //15.esEnviado()
  esEnviado(): boolean {
    return this.nombre === 'EnBolsinEnviado';
  }

  //39.esAmbitoBolsin()
  esAmbitoBolsin(): boolean {
    return this.ambito === AmbitoEstado.BOLSIN;
  }

  //40.esRecibidoEnCMDestino()
  esRecibidoEnCMDestino(): boolean {
    return this.nombre === 'RecibidoEnCMDestino';
  }

  //42.esAmbitoRemito()
  esAmbitoRemito(): boolean {
    return this.ambito === AmbitoEstado.REMITO;
  }

  //43. esRecibidoYAceptado()
  esRecibidoYAceptado(): boolean {
    return this.nombre === 'RecibidoYAceptado';
  }

  //45.esAmbitoDocumentacion()
  esAmbitoDocumentacion(): boolean {
    return this.ambito === AmbitoEstado.DOCUMENTACION;
  }

  //46.esRecibidaYAceptada()
  esRecibidaYAceptada(): boolean {
    return this.nombre === 'RecibidaYAceptada';
  }
}
