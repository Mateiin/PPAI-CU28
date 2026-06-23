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
    estadoRepo.create({ nombre: 'Preparado',          ambito: AmbitoEstado.BOLSIN,        descripcion: 'Bolsín preparado para envío' }),
    estadoRepo.create({ nombre: 'EnBolsinSaliente',   ambito: AmbitoEstado.BOLSIN,        descripcion: 'Bolsín saliente' }),
    estadoRepo.create({ nombre: 'EnBolsinEnviado',    ambito: AmbitoEstado.BOLSIN,        descripcion: 'Bolsín enviado en tránsito' }),
    estadoRepo.create({ nombre: 'RecibidoEnCMDestino',ambito: AmbitoEstado.BOLSIN,        descripcion: 'Bolsín recibido en CM destino' }),
    // Remito
    estadoRepo.create({ nombre: 'RecibidoYAceptado',  ambito: AmbitoEstado.REMITO,        descripcion: 'Remito recibido y aceptado' }),
    // Documentación
    estadoRepo.create({ nombre: 'Registrada',         ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación registrada' }),
    estadoRepo.create({ nombre: 'EnRemito',           ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación en remito' }),
    estadoRepo.create({ nombre: 'EnBolsinSaliente',   ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación en bolsín saliente' }),
    estadoRepo.create({ nombre: 'EnBolsinEnviado',    ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación en bolsín enviado' }),
    estadoRepo.create({ nombre: 'NoRecibida',         ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación no recibida (faltante)' }),
    estadoRepo.create({ nombre: 'RecibidaYRechazada', ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación recibida y rechazada' }),
    estadoRepo.create({ nombre: 'RecibidaYAceptada',  ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación recibida y aceptada' }),
    estadoRepo.create({ nombre: 'ParaRedirigir',      ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación para redirigir' }),
    estadoRepo.create({ nombre: 'DeBaja',             ambito: AmbitoEstado.DOCUMENTACION, descripcion: 'Documentación dada de baja' }),
  ]);

  const estadoEnBolsinEnviado = estados.find((e) => e.nombre === 'EnBolsinEnviado' && e.esAmbitoBolsin())!;
  const estadoDocEnBolsinEnviado = estados.find((e) => e.nombre === 'EnBolsinEnviado' && e.esAmbitoDocumentacion())!;

  // ── Comisiones Médicas ───────────────────────────────────────────────────
  const cmOrigen = await cmRepo.save(cmRepo.create({ nombre: 'CM Central', codigo: 'CMC-001', email: 'central@hospital.com', telefono: '0351-111111' }));
  const cmDestino = await cmRepo.save(cmRepo.create({ nombre: 'CM Norte', codigo: 'CMN-002', email: 'norte@hospital.com', telefono: '0351-222222' }));

  // ── Empleado + Usuario + Sesión activa ──────────────────────────────────
  const empleado = await empleadoRepo.save(empleadoRepo.create({ nombre: 'Ana', apellido: 'González', legajo: 'EMP001', email: 'ana@hospital.com', cmAsignada: cmDestino }));
  const usuario = await usuarioRepo.save(usuarioRepo.create({ nombreUsuario: 'ana.gonzalez', hashPassword: '1234', empleado }));
  const sesion = await sesionRepo.save(sesionRepo.create({ fechaHoraInicio: new Date(), fechaHoraFin: null, usuario }));

  // ── Tipos de documento ──────────────────────────────────────────────────
  const tipoExpediente = await tipoDocRepo.save(tipoDocRepo.create({ nombre: 'Expediente', descripcion: 'Expediente administrativo' }));
  const tipoNota = await tipoDocRepo.save(tipoDocRepo.create({ nombre: 'Nota', descripcion: 'Nota interna' }));

  // ── Solicitud de remito ─────────────────────────────────────────────────
  const solicitud = await solicitudRemitoRepo.save(solicitudRemitoRepo.create({ numero: 'SR-001', fecha: new Date('2026-06-20') }));

  // ── Documentaciones ─────────────────────────────────────────────────────
  const doc1 = await docRepo.save(docRepo.create({ numero: 'DOC-001', asunto: 'Expediente 123 - correcta', tipoDocumento: tipoExpediente, cEstadosDocumento: [] }));
  const doc2 = await docRepo.save(docRepo.create({ numero: 'DOC-002', asunto: 'Nota sin firma', tipoDocumento: tipoNota, cEstadosDocumento: [] }));
  const doc3 = await docRepo.save(docRepo.create({ numero: 'DOC-003', asunto: 'Expediente con hojas faltantes', tipoDocumento: tipoExpediente, cEstadosDocumento: [] }));
  const doc4 = await docRepo.save(docRepo.create({ numero: 'DOC-004', asunto: 'Expediente destino incorrecto', tipoDocumento: tipoExpediente, cEstadosDocumento: [] }));

  // Estado inicial de cada documentación: EnBolsinEnviado
  for (const doc of [doc1, doc2, doc3, doc4]) {
    await ctrlDocRepo.save(ctrlDocRepo.create({ estado: estadoDocEnBolsinEnviado, fechaHoraInicio: new Date('2026-06-21T10:00:00'), fechaHoraFin: null, documentacion: doc }));
  }

  // ── Remito + DetalleRemito ──────────────────────────────────────────────
  const remito = await remitoRepo.save(remitoRepo.create({ numero: 'REM-001', fecha: new Date('2026-06-21'), solicitudRemito: solicitud, cEstadosRemito: [] }));
  for (const doc of [doc1, doc2, doc3, doc4]) {
    await detalleRemitoRepo.save(detalleRemitoRepo.create({ remito, documentacion: doc }));
  }

  // ── Bolsín en estado EnBolsinEnviado ────────────────────────────────────
  const bolsin = await bolsinRepo.save(bolsinRepo.create({
    nroBolsin: 'BOL-001',
    fecha: new Date('2026-06-21'),
    peso: 2.5,
    nroPrecinto: 'PREC-001',
    cmOrigen,
    cmDestino,
    empleadoResponsable: empleado,
    cEstadosBolsin: [],
  }));

  // Asociar remito al bolsín
  remito.bolsin = bolsin;
  await remitoRepo.save(remito);

  await ctrlBolsinRepo.save(ctrlBolsinRepo.create({
    estado: estadoEnBolsinEnviado,
    fechaHoraInicio: new Date('2026-06-21T08:00:00'),
    fechaHoraFin: null,
    logEmpleado: empleado.getNombreCompleto(),
    responsableCE: empleado,
    bolsin,
  }));

  console.log(`Seed completado.
  - Usuario: ana.gonzalez (id: ${usuario.id})
  - Bolsín: BOL-001 (id: ${bolsin.id}) — estado: EnBolsinEnviado
  - 4 documentaciones en estado EnBolsinEnviado`);

  await app.close();
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
