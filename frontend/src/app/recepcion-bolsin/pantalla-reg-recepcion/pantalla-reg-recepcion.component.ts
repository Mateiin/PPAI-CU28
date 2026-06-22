import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RecepcionBolsinService } from '../recepcion-bolsin.service';
import { BolsinDto, DocumentacionDto, OpcionRecepcionRequest } from '../models';

@Component({
  selector: 'app-pantalla-reg-recepcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pantalla-reg-recepcion.component.html',
})
export class PantallaRegRecepcionComponent implements OnInit {
  // Atributos de la pantalla (diagrama)
  nombreCM: string | null = null;
  bolsines: BolsinDto[] = [];
  bolsinSeleccionado: BolsinDto | null = null;
  form!: FormGroup;

  cargando = false;
  procesando = false;
  error: string | null = null;
  resultado: string | null = null;

  readonly opcionesRecepcion = [
    { valor: 'aceptar',   etiqueta: 'Aceptar' },
    { valor: 'rechazar',  etiqueta: 'Rechazar' },
    { valor: 'faltante',  etiqueta: 'Registrar faltante' },
    { valor: 'redirigir', etiqueta: 'Redirigir' },
  ];

  constructor(
    private readonly service: RecepcionBolsinService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ── Paso 2: abrirVentana ───────────────────────────────────────────────
  ngOnInit(): void {
    this.abrirVentana();
  }

  abrirVentana(): void {
    this.cargando = true;
    this.error = null;
    this.service.getBolsinesARecepcionar().subscribe({
      next: (data) => {
        this.bolsines = data;
        this.cargando = false;
        if (data.length > 0) {
          this.nombreCM = data[0].cmDestino ?? null;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los bolsines. Verificar que el backend esté activo.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Paso 22: seleccionarBolsin ─────────────────────────────────────────
  seleccionarBolsin(bolsin: BolsinDto): void {
    this.bolsinSeleccionado = bolsin;
    this.resultado = null;
    this.error = null;

    const todasLasDoc: DocumentacionDto[] = bolsin.remitos.flatMap((r) => r.documentaciones);

    const opciones = this.fb.array(
      todasLasDoc.map((doc) =>
        this.fb.group({
          documentacionId: [doc.id, Validators.required],
          opcion: ['aceptar', Validators.required],
        }),
      ),
    );

    this.form = this.fb.group({ opciones });
  }

  get opcionesArray(): FormArray {
    return this.form.get('opciones') as FormArray;
  }

  todasLasDocumentaciones(): DocumentacionDto[] {
    return this.bolsinSeleccionado?.remitos.flatMap((r) => r.documentaciones) ?? [];
  }

  // ── Paso 36: confirmarSelec ────────────────────────────────────────────
  confirmar(): void {
    if (!this.bolsinSeleccionado || this.form.invalid) return;

    this.procesando = true;
    this.error = null;
    this.resultado = null;

    const payload = {
      usuarioId: 1,
      bolsinId: this.bolsinSeleccionado.id,
      opciones: this.form.value.opciones as OpcionRecepcionRequest[],
    };

    this.service.recepcionar(payload).subscribe({
      next: (res) => {
        this.procesando = false;
        this.resultado =
          `Bolsín ${res.nroBolsin} recepcionado. Estado: ${res.estadoFinal ?? '-'}. ` +
          res.documentacionesProcesadas.map((d) => `${d.numero}: ${d.estadoFinal ?? '-'}`).join(' | ');
        this.bolsinSeleccionado = null;
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

  // ── Paso cancelar ──────────────────────────────────────────────────────
  cancelar(): void {
    this.bolsinSeleccionado = null;
    this.resultado = null;
    this.error = null;
  }
}
