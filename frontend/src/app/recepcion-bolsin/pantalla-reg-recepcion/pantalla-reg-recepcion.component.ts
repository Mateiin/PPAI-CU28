import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecepcionBolsinService } from '../recepcion-bolsin.service';
import { BolsinDto, DocumentacionDto, OpcionRecepcion, OpcionRecepcionRequest } from '../models';

type Fase = 'lista' | 'opcion' | 'marcar';

@Component({
  selector: 'app-pantalla-reg-recepcion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pantalla-reg-recepcion.component.html',
})
export class PantallaRegRecepcionComponent implements OnInit {
  // Atributos de la pantalla (diagrama)
  nombreCM: string | null = null;
  bolsines: BolsinDto[] = [];
  bolsinSeleccionado: BolsinDto | null = null;
  notificacion: string | null = null;

  // Flujo por fases
  fase: Fase = 'lista';
  opcionGlobal: number | null = null;
  docsAfectadas = new Set<number>();

  // Filtros del listado (A1/A2)
  filtroPrecinto = '';
  filtroCMOrigen = '';

  // Estado UI
  ventanaHabilitada = false;
  cargando = false;
  procesando = false;
  error: string | null = null;
  resultado: string | null = null;

  readonly opcionesRecepcion = [
    { valor: 1, etiqueta: 'El contenido del bolsín es igual al registrado' },
    { valor: 2, etiqueta: 'No se recibe toda la documentación asociada a los remitos' },
    { valor: 3, etiqueta: 'Existe documentación que no corresponde al destino' },
    { valor: 4, etiqueta: 'La documentación se debe redirigir a otra área' },
  ];

  constructor(
    private readonly service: RecepcionBolsinService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

  // ── Métodos del diagrama PantallaRegRecepBolsin ───────────────────────

  opcRegistrarRecepcionDeBolsin(): void {
    this.habilitarVentana();
  }

  abrirVentana(): void {
    this.cargando = true;
    this.error = null;
    this.service.getBolsinesARecepcionar().subscribe({
      next: (data) => {
        this.nombreCM = data.cmUsuario;
        this.bolsines = data.bolsines;
        this.cargando = false;
        this.mostrarCMDelUsuario();
        this.mostrarListadoBolsines();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los bolsines. Verificar que el backend esté activo.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  mostrarCMDelUsuario(): void {
    // Muestra el nombre de la CM del usuario — binding via nombreCM en el template
  }

  mostrarListadoBolsines(): void {
    this.fase = 'lista';
  }

  seleccionarBolsin(bolsin: BolsinDto): void {
    this.bolsinSeleccionado = bolsin;
    this.opcionGlobal = null;
    this.docsAfectadas = new Set();
    this.resultado = null;
    this.error = null;
    this.mostrarRemitosYDocumentacion();
    this.mostrarOpcionesDeRecepcion();
  }

  mostrarRemitosYDocumentacion(): void {
    this.fase = 'opcion';
  }

  mostrarOpcionesDeRecepcion(): void {
    // Habilita los radio buttons de opción en la fase 'opcion'
  }

  seleccionarOpcionDeRecepcion(): void {
    this.elegirOpcion();
  }

  solicitarConfirmacion(): void {
    this.confirmar();
  }

  confirmarSelec(): void {
    this.confirmar();
  }

  notificarOperacionExitosa(): void {
    this.resultado = `Bolsín ${this.bolsinSeleccionado?.nroBolsin ?? ''} recepcionado exitosamente.`;
    this.notificacion = this.resultado;
  }

  cancelar(): void {
    this.bolsinSeleccionado = null;
    this.opcionGlobal = null;
    this.docsAfectadas = new Set();
    this.resultado = null;
    this.error = null;
    this.fase = 'lista';
  }

  // ── Flujo interno ──────────────────────────────────────────────────────

  habilitarVentana(): void {
    this.ventanaHabilitada = true;
    this.abrirVentana();
  }

  get bolsinesFiltrados(): BolsinDto[] {
    return this.bolsines.filter((b) => {
      const matchPrecinto =
        !this.filtroPrecinto ||
        b.nroPrecinto?.toLowerCase().includes(this.filtroPrecinto.toLowerCase());
      const matchCM =
        !this.filtroCMOrigen ||
        b.cmOrigen?.toLowerCase().includes(this.filtroCMOrigen.toLowerCase());
      return matchPrecinto && matchCM;
    });
  }

  elegirOpcion(): void {
    if (!this.opcionGlobal) return;
    if (this.opcionGlobal === 1) {
      this.confirmar();
    } else {
      this.docsAfectadas = new Set();
      this.fase = 'marcar';
    }
  }

  toggleDoc(docId: number): void {
    if (this.docsAfectadas.has(docId)) {
      this.docsAfectadas.delete(docId);
    } else {
      this.docsAfectadas.add(docId);
    }
  }

  estaAfectada(docId: number): boolean {
    return this.docsAfectadas.has(docId);
  }

  todasLasDocumentaciones(): DocumentacionDto[] {
    return this.bolsinSeleccionado?.remitos.flatMap((r) => r.documentaciones) ?? [];
  }

  confirmar(): void {
    if (!this.bolsinSeleccionado || !this.opcionGlobal) return;

    const confirmado = window.confirm('¿Confirma el registro de la recepción del bolsín?');
    if (!confirmado) return;

    this.procesando = true;
    this.error = null;

    const payload = {
      usuarioId: this.service.usuarioId,
      bolsinId: this.bolsinSeleccionado.id,
      opciones: this.buildOpciones(),
    };

    this.service.recepcionar(payload).subscribe({
      next: () => {
        this.procesando = false;
        this.notificarOperacionExitosa();
        this.bolsinSeleccionado = null;
        this.opcionGlobal = null;
        this.fase = 'lista';
        this.cdr.detectChanges();
        this.abrirVentana();
      },
      error: () => {
        this.procesando = false;
        this.error = 'Error al procesar la recepción.';
        this.cdr.detectChanges();
      },
    });
  }

  volverAOpciones(): void {
    this.fase = 'opcion';
    this.docsAfectadas = new Set();
  }

  private buildOpciones(): OpcionRecepcionRequest[] {
    return this.todasLasDocumentaciones().map((doc) => ({
      documentacionId: doc.id,
      opcion: this.resolverOpcionDoc(doc.id),
    }));
  }

  private resolverOpcionDoc(docId: number): OpcionRecepcion {
    if (!this.docsAfectadas.has(docId)) return 'aceptar';
    switch (this.opcionGlobal) {
      case 2: return 'faltante';
      case 3: return 'rechazar';
      case 4: return 'redirigir';
      default: return 'aceptar';
    }
  }
}
