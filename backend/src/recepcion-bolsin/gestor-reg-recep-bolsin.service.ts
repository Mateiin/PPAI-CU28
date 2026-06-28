import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bolsin } from './entities/bolsin.entity';
import { Remito } from './entities/remito.entity';
import { Documentacion } from './entities/documentacion.entity';
import { Sesion } from './entities/sesion.entity';
import { Estado } from './entities/estado.entity';
import { Empleado } from './entities/empleado.entity';
import { Usuario } from './entities/usuario.entity';
import { ComisionMedica } from './entities/comision-medica.entity';
import { RecepcionarBolsinDto, OpcionRecepcionDto } from './dto/recepcionar-bolsin.dto';
import { BolsinResponseDto, BolsinesListaResponseDto, ResultadoRecepcionDto } from './dto/bolsin-response.dto';

@Injectable({ scope: Scope.REQUEST })
export class GestorRegRecepBolsin {
  // Atributos de instancia del diagrama
  private empleadoLogueado: Empleado | null = null;
  private cmDestinoEmpleado: ComisionMedica | null = null;
  private listaBolsinesEnviados: Bolsin[] = [];
  private datosRemitosYDocumentacion: object[] = [];
  private bolsinSeleccionado: Bolsin | null = null;
  private opcionSeleccionada: string | null = null;
  private estadoRecibidoEnCMDestino: Estado | null = null;
  private estadoRecibidoYAceptado: Estado | null = null;
  private estadoDocRecibidaYAceptada: Estado | null = null;
  private estadoDocNoRecibida: Estado | null = null;
  private estadoDocRecibidaYRechazada: Estado | null = null;
  private estadoDocParaRedirigir: Estado | null = null;
  private fechaHoraActual: Date | null = null;

  constructor(
    @InjectRepository(Bolsin)
    private readonly bolsinRepo: Repository<Bolsin>,

    @InjectRepository(Remito)
    private readonly remitoRepo: Repository<Remito>,

    @InjectRepository(Documentacion)
    private readonly documentacionRepo: Repository<Documentacion>,

    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,

    @InjectRepository(Estado)
    private readonly estadoRepo: Repository<Estado>,
  ) {}

  // ── Paso 4: buscar empleado logueado ───────────────────────────────────

  async buscarEmpleadoLogueado(usuarioId: number): Promise<Empleado> {
    const sesiones = await this.sesionRepo.find({
      where: { usuario: { id: usuarioId } },
      relations: { usuario: { empleado: { cmAsignada: true } } },
    });
    let usuario: Usuario | null = null;
    for (const sesion of sesiones) {
      const u = sesion.buscarUsuarioLogueado();
      if (u) { usuario = u; break; }
    }
    if (!usuario) throw new NotFoundException('No hay sesión activa');
    this.empleadoLogueado = usuario.obtenerEmpleado();
    return this.empleadoLogueado!;
  }

  // ── Paso 7: buscar CM destino del usuario ──────────────────────────────

  buscarCMDestinoDelUsuario(): ComisionMedica | null {
    this.cmDestinoEmpleado = this.empleadoLogueado?.getCM() ?? null;
    return this.cmDestinoEmpleado;
  }

  // ── Paso 11: obtener bolsines en estado Enviado para la CM del usuario ──

  async obtenerBolsinesEnEstadoEnviado(): Promise<Bolsin[]> {
    const todos = await this.bolsinRepo.find({
      relations: {
        cEstadosBolsin: { estado: true },
        cmDestino: true,
        cmOrigen: true,
        remitos: {
          cEstadosRemito: { estado: true },
          detallesRemito: {
            documentacion: {
              cEstadosDocumento: { estado: true },
              tipoDocumento: true,
            },
          },
        },
      },
    });

    this.listaBolsinesEnviados = todos.filter(
      (b) => b.sosEnviado() && b.esTuCMDestino(this.cmDestinoEmpleado!),
    );
    return this.listaBolsinesEnviados;
  }

  // ── Paso 20: listar bolsines ───────────────────────────────────────────

  listarBolsines(): BolsinResponseDto[] {
    return this.listaBolsinesEnviados.map((b) => this.mapBolsinToDto(b));
  }

  // ── Paso 23: tomar bolsín seleccionado ────────────────────────────────

  tomarBolsinSeleccionado(bolsinId: number): void {
    const encontrado = this.listaBolsinesEnviados.find((b) => b.id === bolsinId);
    if (!encontrado) throw new NotFoundException(`Bolsín ${bolsinId} no está en la lista`);
    this.bolsinSeleccionado = encontrado;
  }

  // ── Paso 24-30: obtener información de remitos y docs ─────────────────

  obtenerInformacionRemito(): object {
    if (!this.bolsinSeleccionado) throw new NotFoundException('No hay bolsín seleccionado');
    this.datosRemitosYDocumentacion = this.bolsinSeleccionado.obtenerInformacionRemito().map((r) => ({
      numero: r.getNumero(),
      documentaciones: r.tomarDocumentacion().map((dr) => ({
        id: dr.getDocumentacion().id,
        asunto: dr.getDocumentacion().getAsunto(),
        tipoDocumento: dr.getDocumentacion().tipoDocumento?.getNombre(),
      })),
    }));
    return this.datosRemitosYDocumentacion;
  }

  // ── Paso 33: tomar opción de recepción seleccionada ───────────────────

  tomarOpcionDeRecepcionSeleccionada(opcion: string): void {
    this.opcionSeleccionada = opcion;
  }

  // ── Paso 39-47: buscar estados necesarios ─────────────────────────────

  buscarEstadoRecibidoEnCMD(estados: Estado[]): Estado | null {
    this.estadoRecibidoEnCMDestino =
      estados.find((e) => e.esAmbitoBolsin() && e.esRecibidoEnCMDestino()) ?? null;
    return this.estadoRecibidoEnCMDestino;
  }

  buscarEstadoRecibidoYAceptado(estados: Estado[]): Estado | null {
    this.estadoRecibidoYAceptado =
      estados.find((e) => e.esAmbitoRemito() && e.esRecibidoYAceptado()) ?? null;
    return this.estadoRecibidoYAceptado;
  }

  buscarEstadoRecibidaYAceptada(estados: Estado[]): Estado | null {
    this.estadoDocRecibidaYAceptada =
      estados.find((e) => e.esAmbitoDocumentacion() && e.esRecibidaYAceptada()) ?? null;
    return this.estadoDocRecibidaYAceptada;
  }

  // ── Paso 48: obtener fecha/hora actual ────────────────────────────────

  obtenerFechaHoraActual(): Date {
    this.fechaHoraActual = new Date();
    return this.fechaHoraActual;
  }

  // ── Paso 49: registrar recepción (orquestador principal) ───────────────

  async registrarRecepcionDeBolsin(dto: RecepcionarBolsinDto): Promise<ResultadoRecepcionDto> {
    await this.buscarEmpleadoLogueado(dto.usuarioId);
    this.buscarCMDestinoDelUsuario();
    await this.obtenerBolsinesEnEstadoEnviado();
    this.tomarBolsinSeleccionado(dto.bolsinId);

    const todosLosEstados = await this.estadoRepo.find();
    this.buscarEstadoRecibidoEnCMD(todosLosEstados);
    this.buscarEstadoRecibidoYAceptado(todosLosEstados);
    this.buscarEstadoRecibidaYAceptada(todosLosEstados);

    this.estadoDocNoRecibida =
      todosLosEstados.find((e) => e.esAmbitoDocumentacion() && e.nombre === 'NoRecibida') ?? null;
    this.estadoDocRecibidaYRechazada =
      todosLosEstados.find((e) => e.esAmbitoDocumentacion() && e.nombre === 'RecibidaYRechazada') ?? null;
    this.estadoDocParaRedirigir =
      todosLosEstados.find((e) => e.esAmbitoDocumentacion() && e.nombre === 'ParaRedirigir') ?? null;

    const bolsin = this.bolsinSeleccionado!;
    const fechaHoraActual = this.obtenerFechaHoraActual();

    // Actualizar estado del bolsín
    if (!this.estadoRecibidoEnCMDestino) throw new NotFoundException('Estado RecibidoEnCMDestino no encontrado');
    bolsin.registrarRecepcion(this.estadoRecibidoEnCMDestino, fechaHoraActual);
    await this.bolsinRepo.save(bolsin);

    // Actualizar estado de cada remito
    if (!this.estadoRecibidoYAceptado) throw new NotFoundException('Estado RecibidoYAceptado no encontrado');
    for (const remito of bolsin.obtenerInformacionRemito()) {
      remito.recibirRemito(this.estadoRecibidoYAceptado, fechaHoraActual);
      await this.remitoRepo.save(remito);
    }

    // Actualizar estado de cada documentación
    for (const remito of bolsin.obtenerInformacionRemito()) {
      for (const detalle of remito.tomarDocumentacion()) {
        const doc = detalle.getDocumentacion();
        const opcion = dto.opciones.find((o) => o.documentacionId === doc.id);
        this.aplicarTransicionDoc(doc, opcion);
        await this.documentacionRepo.save(doc);
      }
    }

    this.llamarCUNotificarRecepcionBolsin();
    return this.finCU(bolsin);
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private aplicarTransicionDoc(doc: Documentacion, opcion: OpcionRecepcionDto | undefined): void {
    switch (opcion?.opcion) {
      case 'rechazar':  doc.rechazarDoc(this.estadoDocRecibidaYRechazada!); break;
      case 'faltante':  doc.registrarFaltante(this.estadoDocNoRecibida!); break;
      case 'redirigir': doc.reenviarDoc(this.estadoDocParaRedirigir!); break;
      default:          doc.aceptarDoc(this.estadoDocRecibidaYAceptada!); break;
    }
  }

  private llamarCUNotificarRecepcionBolsin(): void {
    // Extensión a CU de notificación (fuera del alcance del CU28)
  }

  private finCU(bolsin: Bolsin): ResultadoRecepcionDto {
    return {
      bolsinId: bolsin.id,
      nroBolsin: bolsin.nroBolsin,
      estadoFinal: bolsin.getCambioEstadoActual()?.estado?.nombre ?? null,
      documentacionesProcesadas: bolsin.obtenerInformacionRemito()
        .flatMap((r) => r.tomarDocumentacion())
        .map((dr) => {
          const doc = dr.getDocumentacion();
          return {
            id: doc.id,
            numero: doc.numero,
            estadoFinal: doc.getCambioEstadoActual()?.estado?.nombre ?? null,
          };
        }),
    };
  }

  // ── Endpoint de consulta inicial (GET) ────────────────────────────────

  async getBolsinesARecepcionar(usuarioId: number): Promise<BolsinesListaResponseDto> {
    await this.buscarEmpleadoLogueado(usuarioId);
    this.buscarCMDestinoDelUsuario();
    await this.obtenerBolsinesEnEstadoEnviado();
    return {
      cmUsuario: this.cmDestinoEmpleado?.getNombre() ?? null,
      bolsines: this.listarBolsines(),
    };
  }

  private mapBolsinToDto(b: Bolsin): BolsinResponseDto {
    return {
      id: b.id,
      nroBolsin: b.nroBolsin,
      fecha: b.fecha?.toString() ?? null,
      nroPrecinto: b.getNroPrecinto(),
      cmOrigen: b.getCMOrigen()?.getNombre() ?? null,
      cmDestino: b.cmDestino?.getNombre() ?? null,
      remitos: b.obtenerInformacionRemito().map((r) => ({
        numero: r.getNumero(),
        documentaciones: r.tomarDocumentacion().map((dr) => {
          const doc = dr.getDocumentacion();
          return {
            id: doc.id,
            numero: doc.numero,
            asunto: doc.getAsunto(),
            tipoDocumento: doc.tipoDocumento?.nombre ?? null,
            estadoActual: doc.getCambioEstadoActual()?.estado?.nombre ?? null,
          };
        }),
      })),
    };
  }
}
