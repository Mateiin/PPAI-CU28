import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ComisionMedica } from '../recepcion-bolsin/entities/comision-medica.entity';
import { Estado, AmbitoEstado } from '../recepcion-bolsin/entities/estado.entity';
import { TipoDocumento } from '../recepcion-bolsin/entities/tipo-documento.entity';
import { Empleado } from '../recepcion-bolsin/entities/empleado.entity';
import { Usuario } from '../recepcion-bolsin/entities/usuario.entity';
import { Sesion } from '../recepcion-bolsin/entities/sesion.entity';
import { SolicitudRemito } from '../recepcion-bolsin/entities/solicitud-remito.entity';
import { Remito } from '../recepcion-bolsin/entities/remito.entity';
import { DetalleRemito } from '../recepcion-bolsin/entities/detalle-remito.entity';
import { Documentacion } from '../recepcion-bolsin/entities/documentacion.entity';
import { Bolsin } from '../recepcion-bolsin/entities/bolsin.entity';
import { CambioEstadoBolsin } from '../recepcion-bolsin/entities/control-estado-bolsin.entity';
import { CambioEstadoDocumentacion } from '../recepcion-bolsin/entities/control-estado-documentacion.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const cmRepo: Repository<ComisionMedica> = app.get(getRepositoryToken(ComisionMedica));
  const estadoRepo: Repository<Estado> = app.get(getRepositoryToken(Estado));
  const tipoDocRepo: Repository<TipoDocumento> = app.get(getRepositoryToken(TipoDocumento));
  const empleadoRepo: Repository<Empleado> = app.get(getRepositoryToken(Empleado));
  const usuarioRepo: Repository<Usuario> = app.get(getRepositoryToken(Usuario));
  const sesionRepo: Repository<Sesion> = app.get(getRepositoryToken(Sesion));
  const solicitudRemitoRepo: Repository<SolicitudRemito> = app.get(getRepositoryToken(SolicitudRemito));
  const remitoRepo: Repository<Remito> = app.get(getRepositoryToken(Remito));
  const detalleRemitoRepo: Repository<DetalleRemito> = app.get(getRepositoryToken(DetalleRemito));
  const docRepo: Repository<Documentacion> = app.get(getRepositoryToken(Documentacion));
  const bolsinRepo: Repository<Bolsin> = app.get(getRepositoryToken(Bolsin));
  const ctrlBolsinRepo: Repository<CambioEstadoBolsin> = app.get(getRepositoryToken(CambioEstadoBolsin));
  const ctrlDocRepo: Repository<CambioEstadoDocumentacion> = app.get(getRepositoryToken(CambioEstadoDocumentacion));

  // ── Estados ─────────────────────────────────────────────────────────────
  const estados = await estadoRepo.save([
    // Bolsín
    estadoRepo.create({ nombre: 'Preparado',           ambito: AmbitoEstado.BOLSIN,        descripcion: 'Bolsín preparado para envío' }),
    estadoRepo.create({ nombre: 'EnBolsinSaliente',    ambito: AmbitoEstado.BOLSIN,        descripcion: 'Bolsín saliente' }),
    estadoRepo.create({ nombre: 'EnBolsinEnviado',     ambito: AmbitoEstado.BOLSIN,        descripcion: 'Bolsín enviado en tránsito' }),
    estadoRepo.create({ nombre: 'RecibidoEnCMDestino', ambito: AmbitoEstado.BOLSIN,        descripcion: 'Bolsín recibido en CM destino' }),
    // Remito
    estadoRepo.create({ nombre: 'RecibidoYAceptado',   ambito: AmbitoEstado.REMITO,        descripcion: 'Remito recibido y aceptado' }),
    // Documentación
    estadoRepo.create({ nombre: 'Registrada',          ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación registrada' }),
    estadoRepo.create({ nombre: 'EnRemito',            ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación en remito' }),
    estadoRepo.create({ nombre: 'EnBolsinSaliente',    ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación en bolsín saliente' }),
    estadoRepo.create({ nombre: 'EnBolsinEnviado',     ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación en bolsín enviado' }),
    estadoRepo.create({ nombre: 'NoRecibida',          ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación no recibida (faltante)' }),
    estadoRepo.create({ nombre: 'RecibidaYRechazada',  ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación recibida y rechazada' }),
    estadoRepo.create({ nombre: 'RecibidaYAceptada',   ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación recibida y aceptada' }),
    estadoRepo.create({ nombre: 'ParaRedirigir',       ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación para redirigir' }),
    estadoRepo.create({ nombre: 'DeBaja',              ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación dada de baja' }),
  ]);

  const estBolsinEnviado    = estados.find((e) => e.nombre === 'EnBolsinEnviado' && e.esAmbitoBolsin())!;
  const estDocEnBolsinEnv   = estados.find((e) => e.nombre === 'EnBolsinEnviado' && e.esAmbitoDocumentacion())!;

  // ── Comisiones Médicas ───────────────────────────────────────────────────
  const cmCentral  = await cmRepo.save(cmRepo.create({ nombre: 'CM Central', codigo: 'CMC-001', direccion: 'Av. Colón 1234', email: 'central@hospital.com', telefono: '0351-111111' }));
  const cmNorte    = await cmRepo.save(cmRepo.create({ nombre: 'CM Norte',   codigo: 'CMN-002', direccion: 'Bv. Illia 567',  email: 'norte@hospital.com',   telefono: '0351-222222' }));
  const cmSur      = await cmRepo.save(cmRepo.create({ nombre: 'CM Sur',     codigo: 'CMS-003', direccion: 'Ruta 9 km 10',   email: 'sur@hospital.com',     telefono: '0351-333333' }));

  // ── Empleado + Usuario + Sesión activa ──────────────────────────────────
  const empleado = await empleadoRepo.save(empleadoRepo.create({ nombre: 'Ana', apellido: 'González', email: 'ana@hospital.com', cmAsignada: cmNorte }));
  const usuario  = await usuarioRepo.save(usuarioRepo.create({ nombre: 'ana.gonzalez', hashPassword: '1234', empleado }));
  await sesionRepo.save(sesionRepo.create({ fechaHoraInicio: new Date(), fechaHoraFin: null, usuario }));

  // ── Tipos de documento ──────────────────────────────────────────────────
  const tipoExpediente = await tipoDocRepo.save(tipoDocRepo.create({ nombre: 'Expediente', descripcion: 'Expediente administrativo' }));
  const tipoNota       = await tipoDocRepo.save(tipoDocRepo.create({ nombre: 'Nota',       descripcion: 'Nota interna' }));
  const tipoInforme    = await tipoDocRepo.save(tipoDocRepo.create({ nombre: 'Informe',    descripcion: 'Informe médico' }));

  // ── Helper para crear un bolsín completo ────────────────────────────────
  async function crearBolsin(
    nro: string,
    nroPrecinto: string,
    peso: number,
    fecha: Date,
    cmOrigen: ComisionMedica,
    cmDestino: ComisionMedica,
    solicitudNro: string,
    remitoNro: string,
    docs: { numero: string; asunto: string; tipo: TipoDocumento }[],
  ) {
    const solicitud = await solicitudRemitoRepo.save(
      solicitudRemitoRepo.create({ numero: solicitudNro, fecha }),
    );

    const documentaciones: Documentacion[] = [];
    for (const d of docs) {
      const doc = await docRepo.save(docRepo.create({ numero: d.numero, asunto: d.asunto, tipoDocumento: d.tipo, cEstadosDocumento: [] }));
      await ctrlDocRepo.save(ctrlDocRepo.create({ estado: estDocEnBolsinEnv, fechaHoraInicio: fecha, fechaHoraFin: null, documentacion: doc }));
      documentaciones.push(doc);
    }

    const remito = await remitoRepo.save(
      remitoRepo.create({ numero: remitoNro, fecha, solicitudRemito: solicitud, cEstadosRemito: [] }),
    );
    for (const doc of documentaciones) {
      await detalleRemitoRepo.save(detalleRemitoRepo.create({ remito, documentacion: doc }));
    }

    const bolsin = await bolsinRepo.save(bolsinRepo.create({
      nroBolsin: nro, fecha, peso, nroPrecinto, cmOrigen, cmDestino,
      empleadoResponsable: empleado, cEstadosBolsin: [],
    }));

    remito.bolsin = bolsin;
    await remitoRepo.save(remito);

    await ctrlBolsinRepo.save(ctrlBolsinRepo.create({
      estado: estBolsinEnviado,
      fechaHoraInicio: fecha,
      fechaHoraFin: null,
      bolsin,
    }));

    return bolsin;
  }

  // ── 5 Bolsines en estado EnBolsinEnviado ────────────────────────────────
  await crearBolsin('BOL-001', 'PREC-001', 2.5, new Date('2026-06-20'), cmCentral, cmNorte, 'SR-001', 'REM-001', [
    { numero: 'DOC-001', asunto: 'Expediente 4521 - Licencia médica',     tipo: tipoExpediente },
    { numero: 'DOC-002', asunto: 'Nota de solicitud de insumos',          tipo: tipoNota       },
    { numero: 'DOC-003', asunto: 'Informe de auditoría enero',            tipo: tipoInforme    },
  ]);

  await crearBolsin('BOL-002', 'PREC-002', 1.8, new Date('2026-06-21'), cmCentral, cmNorte, 'SR-002', 'REM-002', [
    { numero: 'DOC-004', asunto: 'Expediente 4522 - Baja por enfermedad', tipo: tipoExpediente },
    { numero: 'DOC-005', asunto: 'Nota interna - cambio de guardia',      tipo: tipoNota       },
  ]);

  await crearBolsin('BOL-003', 'PREC-003', 3.2, new Date('2026-06-22'), cmSur, cmNorte, 'SR-003', 'REM-003', [
    { numero: 'DOC-006', asunto: 'Expediente 4523 - Alta médica',         tipo: tipoExpediente },
    { numero: 'DOC-007', asunto: 'Informe de guardia nocturna',           tipo: tipoInforme    },
    { numero: 'DOC-008', asunto: 'Nota de derivación',                    tipo: tipoNota       },
    { numero: 'DOC-009', asunto: 'Expediente 4524 - Control periódico',   tipo: tipoExpediente },
  ]);

  await crearBolsin('BOL-004', 'PREC-004', 0.9, new Date('2026-06-23'), cmCentral, cmNorte, 'SR-004', 'REM-004', [
    { numero: 'DOC-010', asunto: 'Nota de requerimiento urgente',         tipo: tipoNota       },
    { numero: 'DOC-011', asunto: 'Informe de resultados de laboratorio',  tipo: tipoInforme    },
  ]);

  await crearBolsin('BOL-005', 'PREC-005', 4.1, new Date('2026-06-24'), cmSur, cmNorte, 'SR-005', 'REM-005', [
    { numero: 'DOC-012', asunto: 'Expediente 4525 - Jubilación',          tipo: tipoExpediente },
    { numero: 'DOC-013', asunto: 'Expediente 4526 - Licencia sin sueldo', tipo: tipoExpediente },
    { numero: 'DOC-014', asunto: 'Nota de traslado de personal',          tipo: tipoNota       },
  ]);

  console.log(`Seed completado.
  - Usuario: ana.gonzalez / 1234
  - 5 bolsines en estado EnBolsinEnviado (BOL-001 al BOL-005)
  - 14 documentaciones listas para recepcionar`);

  await app.close();
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
