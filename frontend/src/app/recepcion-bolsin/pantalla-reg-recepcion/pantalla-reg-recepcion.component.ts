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
  ) { }

  ngOnInit(): void { }

  // ── Paso 1: el EB selecciona la opción ────────────────────────────────
  // 1.opcionRegistrarRecepcionDeBolsin()
  opcionRegistrarRecepcionDeBolsin(): void {
    this.ventanaHabilitada = true;
    this.abrirVentana();
  }

  // ── Paso 2: abrirVentana ───────────────────────────────────────────────
  // 2.abrirVentana()
  abrirVentana(): void {
    this.cargando = true;
    this.error = null;
    this.service.getBolsinesARecepcionar().subscribe({
      next: (data) => {
        this.mostrarCMDelUsuario(data.cmUsuario)
        this.bolsines = data.bolsines;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los bolsines. Verificar que el backend esté activo.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // 10.mostrarCMDelUsuario()
  mostrarCMDelUsuario(cm: string | null): void {
    this.nombreCM = cm; // Asigna y queda disponible para el template
  }

  // ── Filtro para A1/A2 ──────────────────────────────────────────────────
  // 20.mostrarListadoBolsines()
  mostrarListadoBolsines(): BolsinDto[] {
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

  // ── Paso 5: seleccionarBolsin ──────────────────────────────────────────
  // 21.seleccionarBolsin()
  seleccionarBolsin(bolsin: BolsinDto): void {
    this.bolsinSeleccionado = bolsin;
    this.opcionGlobal = null;
    this.docsAfectadas = new Set();
    this.resultado = null;
    this.error = null;
    this.fase = 'opcion';
  }

  // ── Paso 7→8: elegir opción global ────────────────────────────────────
  elegirOpcion(): void {
    if (!this.opcionGlobal) return;
    if (this.opcionGlobal === 1) {
      // Opción 1: todo aceptado, ir directo a confirmación
      this.confirmarSelec();
    } else {
      // Opciones 2/3/4: marcar cuáles docs están afectadas
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

  // 30.mostrarRemitosYDocumentacion()
  mostrarRemitosYDocumentacion(): { numero: string; documentaciones: DocumentacionDto[] }[] {
    return this.bolsinSeleccionado?.remitos.map((r) => ({
      numero: r.numero,
      documentaciones: r.documentaciones,
    })) ?? [];
  }

  // 31.mostrarOpcionesDeRecepcion()
  mostrarOpcionesDeRecepcion(): { valor: number; etiqueta: string }[] {
    return this.opcionesRecepcion;
  }
  // 32.seleccionarOpcionDeRecepcion()
  seleccionarOpcionDeRecepcion(valor: number): void {
  this.opcionGlobal = valor;
  }

  // 34.solicitarConfirmacion()
solicitarConfirmacion(mensaje: string = '¿Confirma el registro de la recepción del bolsín?'): boolean {
  return window.confirm(mensaje);

}
  // ── Paso 9-10: confirmar ───────────────────────────────────────────────
  // 35.confirmarSelec()
  confirmarSelec(): void {
    if (!this.bolsinSeleccionado || !this.opcionGlobal) return;

    const confirmado = this.solicitarConfirmacion();
    if (!confirmado) return;

    this.procesando = true;
    this.error = null;

    const payload = {
      usuarioId: 1,
      bolsinId: this.bolsinSeleccionado.id,
      opciones: this.buildOpciones(),
    };

    this.service.recepcionar(payload).subscribe({
      next: (res) => {
        this.procesando = false;
        this.resultado = `Bolsín ${res.nroBolsin} recepcionado exitosamente.`;
        this.fase = 'lista';
        this.bolsinSeleccionado = null;
        this.opcionGlobal = null;
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

  // ── Paso cancelar (Obs. 1) ─────────────────────────────────────────────
  cancelar(): void {
    this.bolsinSeleccionado = null;
    this.opcionGlobal = null;
    this.docsAfectadas = new Set();
    this.resultado = null;
    this.error = null;
    this.fase = 'lista';
  }

  volverAOpciones(): void {
    this.fase = 'opcion';
    this.docsAfectadas = new Set();
  }

  volverAlInicio(): void {
    localStorage.clear();
    sessionStorage.clear();
    history.replaceState(null, '', 'location.origin');
    location.reload();
  }

  // ── Helpers ────────────────────────────────────────────────────────────

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
