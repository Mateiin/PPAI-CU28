import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmbitoEstado, Estado } from '../recepcion-bolsin/entities/estado.entity';
import { TipoDocumento } from '../recepcion-bolsin/entities/tipo-documento.entity';
import { Empleado } from '../recepcion-bolsin/entities/empleado.entity';
import { ComisionMedica } from '../recepcion-bolsin/entities/comision-medica.entity';
import { Remito } from '../recepcion-bolsin/entities/remito.entity';
import { DetalleRemito } from '../recepcion-bolsin/entities/detalle-remito.entity';
import { Documentacion } from '../recepcion-bolsin/entities/documentacion.entity';
import { Bolsin } from '../recepcion-bolsin/entities/bolsin.entity';
import { CambioEstadoBolsin } from '../recepcion-bolsin/entities/control-estado-bolsin.entity';
import { CambioEstadoDocumentacion } from '../recepcion-bolsin/entities/control-estado-documentacion.entity';

async function seedExtra() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const estadoRepo: Repository<Estado> = app.get(getRepositoryToken(Estado));
  const tipoDocRepo: Repository<TipoDocumento> = app.get(getRepositoryToken(TipoDocumento));
  const empleadoRepo: Repository<Empleado> = app.get(getRepositoryToken(Empleado));
  const cmRepo: Repository<ComisionMedica> = app.get(getRepositoryToken(ComisionMedica));
  const remitoRepo: Repository<Remito> = app.get(getRepositoryToken(Remito));
  const detalleRemitoRepo: Repository<DetalleRemito> = app.get(getRepositoryToken(DetalleRemito));
  const docRepo: Repository<Documentacion> = app.get(getRepositoryToken(Documentacion));
  const bolsinRepo: Repository<Bolsin> = app.get(getRepositoryToken(Bolsin));
  const ctrlBolsinRepo: Repository<CambioEstadoBolsin> = app.get(getRepositoryToken(CambioEstadoBolsin));
  const ctrlDocRepo: Repository<CambioEstadoDocumentacion> = app.get(getRepositoryToken(CambioEstadoDocumentacion));

  // Reutilizar datos maestros ya existentes
  const estadoEnBolsinEnviado = await estadoRepo.findOneOrFail({ where: { nombre: 'EnBolsinEnviado', ambito: AmbitoEstado.BOLSIN } });
  const estadoDocEnBolsinEnviado = await estadoRepo.findOneOrFail({ where: { nombre: 'EnBolsinEnviado', ambito: AmbitoEstado.DOCUMENTACION } });
  const tipoExpediente = await tipoDocRepo.findOneOrFail({ where: { nombre: 'Expediente' } });
  const tipoEstudioMedico = await tipoDocRepo.findOneOrFail({ where: { nombre: 'EstudioMedico' } });
  const cmOrigen = await cmRepo.findOneOrFail({ where: { codigo: 'CMC-001' } });
  const cmDestino = await cmRepo.findOneOrFail({ where: { codigo: 'CMJ-002' } });
  const empleado = await empleadoRepo.findOneOrFail({ where: { id: 1 } });
  // Generar número único para no colisionar
  const suffix = Date.now();
  

  const doc1 = await docRepo.save(docRepo.create({ numero: `DOC-A${suffix}`, asunto: 'Expediente de prueba correcta', tipoDocumento: tipoExpediente, cEstadosDocumento: [] }));
  const doc2 = await docRepo.save(docRepo.create({ numero: `DOC-B${suffix}`, asunto: 'Estudio médico completo', tipoDocumento: tipoEstudioMedico, cEstadosDocumento: [] }));
  const doc3 = await docRepo.save(docRepo.create({ numero: `DOC-C${suffix}`, asunto: 'Expediente con hojas faltantes', tipoDocumento: tipoExpediente, cEstadosDocumento: [] }));
  const doc4 = await docRepo.save(docRepo.create({ numero: `DOC-D${suffix}`, asunto: 'Expediente destino incorrecto', tipoDocumento: tipoExpediente, cEstadosDocumento: [] }));

  for (const doc of [doc1, doc1, doc1, doc1]) {
    await ctrlDocRepo.save(ctrlDocRepo.create({
      estado: estadoDocEnBolsinEnviado,
      fechaHoraInicio: new Date(),
      fechaHoraFin: null,
      documentacion: doc,
    }));
  }

  const remito = await remitoRepo.save(remitoRepo.create({ numero: `REM-${suffix}`, fecha: new Date()}));
  for (const doc of [doc1, doc1, doc1, doc1]) {
    await detalleRemitoRepo.save(detalleRemitoRepo.create({nombre: doc.numero, remito, documentacion: doc }));
  }


  const bolsin = await bolsinRepo.save(bolsinRepo.create({
    nroBolsin: `BOL-${suffix}`,
    fecha: new Date(),
    peso: 1.8,
    nroPrecinto: `PREC-${suffix}`,
    origen: cmOrigen,
    destino: cmDestino,
    cEstadosBolsin: [],
  }));

  remito.bolsin = bolsin;
  await remitoRepo.save(remito);

  await ctrlBolsinRepo.save(ctrlBolsinRepo.create({
    estado: estadoEnBolsinEnviado,
    fechaHoraInicio: new Date(),
    fechaHoraFin: null,
    responsableCE: empleado,
    bolsin,
  }));

  console.log(`Bolsín extra creado: ${bolsin.nroBolsin} — listo para recepcionar.`);
  await app.close();
}

seedExtra().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
