import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bolsin } from './entities/bolsin.entity';
import { Remito } from './entities/remito.entity';
import { Documentacion } from './entities/documentacion.entity';
import { Sesion } from './entities/sesion.entity';
import { Estado } from './entities/estado.entity';
import { Empleado } from './entities/empleado.entity';
import { ComisionMedica } from './entities/comision-medica.entity';
import { RecepcionarBolsinDto, OpcionRecepcionDto } from './dto/recepcionar-bolsin.dto';
import { BolsinResponseDto, BolsinesListaResponseDto, ResultadoRecepcionDto } from './dto/bolsin-response.dto';

@Injectable({ scope: Scope.REQUEST })
export class GestorRegRecepBolsin {
  // Atributos de instancia del diagrama
  private empleadoLogueado: Empleado;
  private cmDestinoEmpleado: ComisionMedica | null = null;
  private listaBolsinesEnviados: Bolsin[] = [];
  private datosRemitosYDocumentacion: object[] = [];
  private bolsinSeleccionado: Bolsin | null = null;
  private opcionSeleccionada: OpcionRecepcionDto | null = null;
  private estadoRecibidoEnCMDestino: Estado | null = null;
  private estadoRecibidoYAceptado: Estado | null = null;
  private estadoDocRecibidaYAceptada: Estado | null = null;
  private estadoDocNoRecibida: Estado | null = null;
  private estadoDocRecibidaYRechazada: Estado | null = null;
  private estadoDocParaRedirigir: Estado | null = null;
  private fechaHoraActual: Date | null = null;
  private confirmacionDeSeleccion: boolean | null = null;


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
  ) { }

  // ── Paso 4: buscar empleado logueado ───────────────────────────────────

  async buscarEmpleadoLogueado(usuarioId: number): Promise<Empleado> {
    const sesiones = await this.sesionRepo.find({
      where: { usuario: { id: usuarioId } },
      relations: { usuario: { empleado: { cmAsignada: true } } },
    });
    const sesion = sesiones.find(s => s.fechaHoraFin === null); // la sesión activa
    if (!sesion) throw new NotFoundException('No hay sesión activa');
    const usuario = sesion.buscarUsuarioLogueado();
    if (!usuario) throw new NotFoundException('No hay usuario en la sesión');
    this.empleadoLogueado = usuario.obtenerEmpleado();
    return this.empleadoLogueado;
  }

  // ── Paso 7: buscar CM destino del usuario ──────────────────────────────

  //7. buscarCMDelUsuario()
  buscarCMDelUsuario(): ComisionMedica | null {
    this.cmDestinoEmpleado = this.empleadoLogueado?.getCM() ?? null;
    return this.cmDestinoEmpleado;
  }

  // ── Paso 11: obtener bolsines en estado Enviado para la CM del usuario ──
  //11. obtenerBolsinesEnEstadoEnviado()
  async obtenerBolsinesEnEstadoEnviado(): Promise<Bolsin[]> {
    const todos = await this.bolsinRepo.find({
      relations: {
        cEstadosBolsin: { estado: true },
        destino: true,
        origen: true,
        remitos: {
          estado: true,
          detallesRemito: {
            documentacion: {
              cEstadosDocumento: { estado: true },
              tipoDocumento: true,
              detallesRemito: true,
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
  //19. listarBolsines()
  listarBolsines(): BolsinResponseDto[] {
    return this.listaBolsinesEnviados.map((b) => this.mapBolsinToDto(b));
  }

  // ── Paso 23: tomar bolsín seleccionado ────────────────────────────────

  //22. tomarBolsinSeleccionado()
  tomarBolsinSeleccionado(bolsinId: number): void {
    const encontrado = this.listaBolsinesEnviados.find((b) => b.id === bolsinId);
    if (!encontrado) throw new NotFoundException(`Bolsín ${bolsinId} no está en la lista`);
    this.bolsinSeleccionado = encontrado;
  }

  //33.tomarOpcionDeRecepcionSeleccionada()
  tomarOpcionDeRecepcionSeleccionada(dto: RecepcionarBolsinDto, docId: number): void {
  this.opcionSeleccionada = dto.opciones.find((o) => o.documentacionId === docId) ?? null;
  }

  //36.tomarConfDeSelec()
  tomarConfDeSelec(dto: RecepcionarBolsinDto): boolean {
    this.confirmacionDeSeleccion = dto.opciones.length > 0;
    if (!this.confirmacionDeSeleccion) {
      throw new NotFoundException('No se confirmó la recepción del bolsín');
    }
    return this.confirmacionDeSeleccion;
  }
  
  // ── Paso 24-30: obtener información de remitos y docs ─────────────────

  //23.obtenerInformacionRemito()
  obtenerInformacionRemito(): object {
    if (!this.bolsinSeleccionado) throw new NotFoundException('No hay bolsín seleccionado');
    this.datosRemitosYDocumentacion = this.bolsinSeleccionado.remitos.map((r) => ({
      numero: r.getNumero(),
      documentaciones: r.tomarDocumentacion().map((dr) => ({
        id: dr.getDocumentacion().id,
        asunto: dr.getDocumentacion().getAsunto(),
        tipoDocumento: dr.getDocumentacion().tipoDocumento?.getNombre(),
      })),
    }));
    return this.datosRemitosYDocumentacion;
  }

  // ── Pasos 38-41-44: buscar estados necesarios ─────────────────────────────

  //38. buscarEstadoRecibidoEnCMD()
  async buscarEstadoRecibidoEnCMD(estados: Estado[]): Promise<Estado | null> {
    this.estadoRecibidoEnCMDestino =
      estados.find((e) => e.esAmbitoBolsin() && e.esRecibidoEnCMDestino()) ?? null;
    return this.estadoRecibidoEnCMDestino;
  }

  //41. buscarEstadoRecibidoYAceptado()
  async buscarEstadoRecibidoYAceptado(estados: Estado[]): Promise<Estado | null> {
    this.estadoRecibidoYAceptado =
      estados.find((e) => e.esAmbitoRemito() && e.esRecibidoYAceptado()) ?? null;
    return this.estadoRecibidoYAceptado;
  }

  //44. buscarEstadoRecibidaYAceptada()
  async buscarEstadoRecibidaYAceptada(estados: Estado[]): Promise<Estado | null> {
    this.estadoDocRecibidaYAceptada =
      estados.find((e) => e.esAmbitoDocumentacion() && e.esRecibidaYAceptada()) ?? null;
    return this.estadoDocRecibidaYAceptada;
  }

  // ── Paso 47: obtener fecha/hora actual ────────────────────────────────

  obtenerFechaHoraActual(): Date {
    return new Date();
  }

  // ── Paso 37: registrar recepción (orquestador principal) ───────────────

  async registrarRecepcionDeBolsin(dto: RecepcionarBolsinDto): Promise<ResultadoRecepcionDto> {
    await this.buscarEmpleadoLogueado(dto.usuarioId);
    this.buscarCMDelUsuario();
    await this.obtenerBolsinesEnEstadoEnviado();
    this.tomarBolsinSeleccionado(dto.bolsinId);
    this.tomarConfDeSelec(dto);

    const todosLosEstados = await this.estadoRepo.find();
    await this.buscarEstadoRecibidoEnCMD(todosLosEstados);
    await this.buscarEstadoRecibidoYAceptado(todosLosEstados);
    await this.buscarEstadoRecibidaYAceptada(todosLosEstados);

    this.estadoDocNoRecibida =
      todosLosEstados.find((e) => e.esAmbitoDocumentacion() && e.nombre === 'NoRecibida') ?? null;
    this.estadoDocRecibidaYRechazada =
      todosLosEstados.find((e) => e.esAmbitoDocumentacion() && e.nombre === 'RecibidaYRechazada') ?? null;
    this.estadoDocParaRedirigir =
      todosLosEstados.find((e) => e.esAmbitoDocumentacion() && e.nombre === 'ParaRedirigir') ?? null;

    const bolsin = this.bolsinSeleccionado!;
    this.fechaHoraActual = this.obtenerFechaHoraActual();

    // Paso 11a: actualizar estado del bolsín
    if (!this.estadoRecibidoEnCMDestino) throw new NotFoundException('Estado RecibidoEnCMDestino no encontrado');
    bolsin.registrarRecepcion(this.estadoRecibidoEnCMDestino, this.fechaHoraActual, this.empleadoLogueado!);
    await this.bolsinRepo.save(bolsin);

    // Paso 11b: actualizar estado de cada remito
    if (!this.estadoRecibidoYAceptado) throw new NotFoundException('Estado RecibidoYAceptado no encontrado');
    for (const remito of bolsin.remitos) {
      remito.recibirRemito(this.estadoRecibidoYAceptado, this.fechaHoraActual);
      await this.remitoRepo.save(remito);
    }

    // Paso 11c: actualizar estado de cada documentación
    for (const remito of bolsin.remitos) {
      for (const detalle of remito.detallesRemito) {
        const doc = detalle.getDocumentacion();
        this.opcionSeleccionada = dto.opciones.find((o) => o.documentacionId === doc.id) ?? null;
        this.aplicarTransicionDoc(doc);
        await this.documentacionRepo.save(doc);
      }
    }

    //61. llamarCUNotificarRecepcionBolsin()
    this.llamarCUNotificarRecepcionBolsin();
  
    //63. finCU()
    return this.finCU(bolsin);

  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private aplicarTransicionDoc(doc: Documentacion): void {
    const empleado = this.empleadoLogueado!;
    switch (this.opcionSeleccionada?.opcion) {
      case 'rechazar': doc.rechazarDoc(this.estadoDocRecibidaYRechazada!, empleado); break;
      case 'faltante': doc.registrarFaltante(this.estadoDocNoRecibida!, empleado); break;
      case 'redirigir': doc.redirigirDocumentacion(this.estadoDocParaRedirigir!, empleado); break;
      default: doc.aceptarDoc(this.estadoDocRecibidaYAceptada!, empleado); break;
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
          const ultimoEstado = doc.cEstadosDocumento?.reduce((prev, curr) =>
            curr.fechaHoraInicio > prev.fechaHoraInicio ? curr : prev,
            doc.cEstadosDocumento[0]
          );
          return {
            id: doc.id,
            numero: doc.numero,
            estadoFinal: ultimoEstado?.estado?.nombre ?? null,
          };
        }),
    };
  }

  // Endpoint de consulta inicial (GET)
  async getBolsinesARecepcionar(usuarioId: number): Promise<BolsinesListaResponseDto> {
    await this.buscarEmpleadoLogueado(usuarioId);
    this.buscarCMDelUsuario();
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
      cmDestino: b.destino?.getNombre() ?? null,
      remitos: b.remitos.map((r) => ({
        numero: r.getNumero(),
        documentaciones: r.tomarDocumentacion().map((dr) => {
          const doc = dr.getDocumentacion();
          const ultimoEstado = doc.cEstadosDocumento?.reduce((prev, curr) =>
            curr.fechaHoraInicio > prev.fechaHoraInicio ? curr : prev,
            doc.cEstadosDocumento[0]
          );
          return {
            id: doc.id,
            numero: doc.numero,
            asunto: doc.getAsunto(),
            tipoDocumento: doc.tipoDocumento?.nombre ?? null,
            estadoActual: ultimoEstado?.estado?.nombre ?? null,
          };
        }),
      })),
    };
  }
}
