import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BolsinesListaResponse, RecepcionarBolsinRequest, ResultadoRecepcion } from './models';

@Injectable({ providedIn: 'root' })
export class RecepcionBolsinService {
  private readonly base = 'http://localhost:3000/recepcion-bolsin';

  // ID del usuario logueado — en una app real vendría del servicio de auth
  private readonly usuarioId = 1;

  constructor(private http: HttpClient) {}

  getBolsinesARecepcionar(): Observable<BolsinesListaResponse> {
    return this.http.get<BolsinesListaResponse>(`${this.base}/bolsines`, {
      params: { usuarioId: this.usuarioId },
    });
  }

  recepcionar(payload: RecepcionarBolsinRequest): Observable<ResultadoRecepcion> {
    return this.http.post<ResultadoRecepcion>(`${this.base}/recepcionar`, payload);
  }
}
