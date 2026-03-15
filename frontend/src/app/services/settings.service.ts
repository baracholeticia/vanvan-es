import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Journey {
  id?: number;
  name: string;
  origin: string;
  destination: string;
}

export interface PricingConfig {
  minimumFare: number;
  perKmRate: number;
  cancellationFee: number;
  commissionRate: number;
}

export interface DriverOption {
  id: string;   // UUID
  name: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly API_URL = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  // --- Trechos ---
  listarTrechos(): Observable<Journey[]> {
    return this.http.get<Journey[]>(`${this.API_URL}/routes`);
  }

  adicionarTrecho(trecho: Journey): Observable<Journey> {
    return this.http.post<Journey>(`${this.API_URL}/routes`, trecho);
  }

  editarTrecho(id: number, trecho: Journey): Observable<Journey> {
    return this.http.put<Journey>(`${this.API_URL}/routes/${id}`, trecho);
  }

  excluirTrecho(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/routes/${id}`);
  }

  listarMotoristas(page = 0, size = 100): Observable<SpringPage<DriverOption>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<SpringPage<DriverOption>>(`${this.API_URL}/drivers`, { params });
  }

  obterTarifaAtual(): Observable<PricingConfig> {
    return this.http.get<PricingConfig>(`${this.API_URL}/settings/pricing`);
  }

  atualizarTarifa(tarifa: PricingConfig): Observable<PricingConfig> {
    return this.http.put<PricingConfig>(`${this.API_URL}/settings/pricing`, tarifa);
  }
}