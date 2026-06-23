export interface DocumentacionDto {
  id: number;
  numero: string;
  asunto: string | null;
  tipoDocumento: string | null;
  estadoActual: string | null;
}

export interface RemitoDto {
  numero: string;
  documentaciones: DocumentacionDto[];
}

export interface BolsinDto {
  id: number;
  nroBolsin: string;
  fecha: string | null;
  nroPrecinto: string | null;
  cmOrigen: string | null;
  cmDestino: string | null;
  remitos: RemitoDto[];
}

export interface BolsinesListaResponse {
  cmUsuario: string | null;
  bolsines: BolsinDto[];
}

export type OpcionRecepcion = 'aceptar' | 'rechazar' | 'faltante' | 'redirigir';

export interface OpcionRecepcionRequest {
  documentacionId: number;
  opcion: OpcionRecepcion;
}

export interface RecepcionarBolsinRequest {
  usuarioId: number;
  bolsinId: number;
  opciones: OpcionRecepcionRequest[];
}

export interface ResultadoRecepcion {
  bolsinId: number;
  nroBolsin: string;
  estadoFinal: string | null;
  documentacionesProcesadas: {
    id: number;
    numero: string;
    estadoFinal: string | null;
  }[];
}
