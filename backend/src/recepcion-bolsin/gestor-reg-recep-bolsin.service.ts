import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bolsin } from './entities/bolsin.entity';
import { Sesion } from './entities/sesion.entity';
import { Estado } from './entities/estado.entity';
import { Empleado } from './entities/empleado.entity';
import { ComisionMedica } from './entities/comision-medica.entity';
import { RecepcionarBolsinDto, OpcionRecepcionDto } from './dto/recepcionar-bolsin.dto';
import { BolsinResponseDto, ResultadoRecepcionDto } from './dto/bolsin-response.dto';

@Injectable()
export class GestorRegRecepBolsin {
  // Atributos de instancia del diagrama
  private empleadoLogueado: Empleado | null = null;
  private cmDestinoEmpleado: ComisionMedica | null = null;
  private listaBolsinesEnviados: Bolsin[] = [];
  private bolsinSeleccionado: Bolsin | null = null;
  private estadoRecibidoEnCMDestino: Estado | null = null;
  private estadoRecibidoYAceptado: Estado | null = null;
  private estadoDocRecibidaYAceptada: Estado | null = null;
  private estadoDocNoRecibida: Estado | null = null;
  private estadoDocRecibidaYRechazada: Estado | null = null;
  private estadoDocParaRedirigir: Estado | null = null;

  constructor(
    @InjectRepository(Bolsin)
    private readonly bolsinRepo: Repository<Bolsin>,

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
    const usuario = Sesion.buscarUsuarioLogueado(sesiones);
    if (!usuario) throw new NotFoundException('No hay sesión activa');
    this.empleadoLogueado = usuario.obtenerEmpleado();
    return this.empleadoLogueado;
  }

  // ── Paso 7: buscar CM destino del usuario ──────────────────────────────

  buscarCMDestinoDelUsuario(): ComisionMedica | null {
    this.cmDestinoEmpleado = this.empleadoLogueado?.getCM() ?? null;
    return this.cmDestinoEmpleado;
  }

  // ── Paso 11: obtener bolsines en estado Enviado ────────────────────────

  async obtenerBolsinesEnEstadoEnviado(): Promise<Bolsin[]> {
    const todos = await this.bolsinRepo.find({
      relations: {
        cEstadosBolsin: { estado: true },
        cmDestino: true,
        cmOrigen: true,
        remitos: {
          detallesRemito: {
            documentacion: {
              cEstadosDocumento: { estado: true },
              tipoDocumento: true,
            },
          },
        },
      },
    });

    this.listaBolsinesEnviados = todos.filter((b) => b.sosEnviado());
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
    return this.bolsinSeleccionado.remitos.map((r) => ({
      numero: r.getNumero(),
      documentaciones: r.tomarDocumentacion().map((dr) => ({
        id: dr.getDocumentacion().id,
        asunto: dr.getDocumentacion().getAsunto(),
        tipoDocumento: dr.getDocumentacion().tipoDocumento?.nombre,
      })),
    }));
  }

  // ── Pasos 39-47: buscar estados necesarios ─────────────────────────────

  async buscarEstadoRecibidoEnCMD(estados: Estado[]): Promise<Estado | null> {
    this.estadoRecibidoEnCMDestino =
      estados.find((e) => e.esAmbitoBolsin() && e.esRecibidoEnCMDestino()) ?? null;
    return this.estadoRecibidoEnCMDestino;
  }

  async buscarEstadoRecibidoYAceptado(estados: Estado[]): Promise<Estado | null> {
    this.estadoRecibidoYAceptado =
      estados.find((e) => e.esAmbitoRemito() && e.esRecibidoYAceptado()) ?? null;
    return this.estadoRecibidoYAceptado;
  }

  async buscarEstadoRecibidaYAceptada(estados: Estado[]): Promise<Estado | null> {
    this.estadoDocRecibidaYAceptada =
      estados.find((e) => e.esAmbitoDocumentacion() && e.esRecibidaYAceptada()) ?? null;
    return this.estadoDocRecibidaYAceptada;
  }

  // ── Paso 48: obtener fecha/hora actual ────────────────────────────────

  obtenerFechaHoraActual(): Date {
    return new Date();
  }

  // ── Paso 49: registrar recepción (orquestador principal) ───────────────

  async registrarRecepcionDeBolsin(dto: RecepcionarBolsinDto): Promise<ResultadoRecepcionDto> {
    // Inicializar empleado y bolsín seleccionado
    await this.buscarEmpleadoLogueado(dto.usuarioId);
    this.buscarCMDestinoDelUsuario();
    await this.obtenerBolsinesEnEstadoEnviado();
    this.tomarBolsinSeleccionado(dto.bolsinId);

    // Buscar todos los estados de una vez
    const todosLosEstados = await this.estadoRepo.find();
    await this.buscarEstadoRecibidoEnCMD(todosLosEstados);
    await this.buscarEstadoRecibidoYAceptado(todosLosEstados);
    await this.buscarEstadoRecibidaYAceptada(todosLosEstados);

    // Resolver estados de documentación según opciones
    this.estadoDocNoRecibida =
      todosLosEstados.find((e) => e.esAmbitoDocumentacion() && e.nombre === 'NoRecibida') ?? null;
    this.estadoDocRecibidaYRechazada =
      todosLosEstados.find((e) => e.esAmbitoDocumentacion() && e.nombre === 'RecibidaYRechazada') ?? null;
    this.estadoDocParaRedirigir =
      todosLosEstados.find((e) => e.esAmbitoDocumentacion() && e.nombre === 'ParaRedirigir') ?? null;

    const bolsin = this.bolsinSeleccionado!;
    const fechaHoraActual = this.obtenerFechaHoraActual();

    // Cambiar estado del bolsín
    if (!this.estadoRecibidoEnCMDestino) throw new NotFoundException('Estado RecibidoEnCMDestino no encontrado');
    bolsin.crearCEBolsin(fechaHoraActual, this.empleadoLogueado!, this.estadoRecibidoEnCMDestino);

    // Cambiar estado de cada documentación
    const todosLosDetalles = bolsin.remitos.flatMap((r) => r.detallesRemito);
    for (const detalle of todosLosDetalles) {
      const opcion = dto.opciones.find((o) => o.documentacionId === detalle.getDocumentacion().id);
      const estadoDoc = this.resolverEstadoDoc(opcion);
      if (estadoDoc) {
        detalle.actualizarEstadoDoc(estadoDoc);
      }
    }

    await this.bolsinRepo.save(bolsin);

    this.llamarCUNotificarRecepcionBolsin();
    return this.finCU(bolsin);
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private resolverEstadoDoc(opcion: OpcionRecepcionDto | undefined): Estado | null {
    if (!opcion) return this.estadoDocRecibidaYAceptada;
    switch (opcion.opcion) {
      case 'aceptar':      return this.estadoDocRecibidaYAceptada;
      case 'rechazar':     return this.estadoDocRecibidaYRechazada;
      case 'faltante':     return this.estadoDocNoRecibida;
      case 'redirigir':    return this.estadoDocParaRedirigir;
      default:             return this.estadoDocRecibidaYAceptada;
    }
  }

  llamarCUNotificarRecepcionBolsin(): void {
    // Extensión a CU de notificación (fuera del alcance del CU28)
  }

  private finCU(bolsin: Bolsin): ResultadoRecepcionDto {
    return {
      bolsinId: bolsin.id,
      nroBolsin: bolsin.nroBolsin,
      estadoFinal: bolsin.getCambioEstadoActual()?.estado?.nombre ?? null,
      documentacionesProcesadas: bolsin.remitos
        .flatMap((r) => r.detallesRemito)
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

  // Endpoint de consulta inicial (GET)
  async getBolsinesARecepcionar(usuarioId: number): Promise<BolsinResponseDto[]> {
    await this.buscarEmpleadoLogueado(usuarioId);
    this.buscarCMDestinoDelUsuario();
    await this.obtenerBolsinesEnEstadoEnviado();
    return this.listarBolsines();
  }

  private mapBolsinToDto(b: Bolsin): BolsinResponseDto {
    return {
      id: b.id,
      nroBolsin: b.nroBolsin,
      fecha: b.fecha?.toString() ?? null,
      nroPrecinto: b.getNroPrecinto(),
      cmOrigen: b.getCMOrigen()?.getNombre() ?? null,
      cmDestino: b.cmDestino?.getNombre() ?? null,
      remitos: b.remitos.map((r) => ({
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
