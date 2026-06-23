export interface DocumentacionResponseDto {
  id: number;
  numero: string;
  asunto: string | null;
  tipoDocumento: string | null;
  estadoActual: string | null;
}

export interface RemitoResponseDto {
  numero: string;
  documentaciones: DocumentacionResponseDto[];
}

export interface BolsinResponseDto {
  id: number;
  nroBolsin: string;
  fecha: string | null;
  nroPrecinto: string | null;
  cmOrigen: string | null;
  cmDestino: string | null;
  remitos: RemitoResponseDto[];
}

export interface BolsinesListaResponseDto {
  cmUsuario: string | null;
  bolsines: BolsinResponseDto[];
}

export interface ResultadoRecepcionDto {
  bolsinId: number;
  nroBolsin: string;
  estadoFinal: string | null;
  documentacionesProcesadas: {
    id: number;
    numero: string;
    estadoFinal: string | null;
  }[];
}
