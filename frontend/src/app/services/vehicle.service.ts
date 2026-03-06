import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VehicleResponse {
  id: string;
  modelName: string;
  licensePlate: string;
  documentPath: string;
  photoPath: string | null;
  driverId: string;
  driverName: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly API_URL = `${environment.apiUrl}/api/vehicles`;

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os veículos de um motorista
   */
  getVehiclesByDriver(driverId: string): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(`${this.API_URL}/driver/${driverId}`);
  }

  /**
   * Busca um veículo por ID
   */
  getVehicleById(vehicleId: string): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.API_URL}/${vehicleId}`);
  }

  /**
   * Cria um novo veículo
   */
  createVehicle(
    driverId: string,
    modelName: string,
    licensePlate: string,
    document: File,
    photo?: File
  ): Observable<VehicleResponse> {
    const formData = new FormData();
    formData.append('driverId', driverId);
    formData.append('modelName', modelName);
    formData.append('licensePlate', licensePlate);
    formData.append('document', document);
    if (photo) {
      formData.append('photo', photo);
    }
    return this.http.post<VehicleResponse>(this.API_URL, formData);
  }

  /**
   * Atualiza um veículo existente
   */
  updateVehicle(
    vehicleId: string,
    modelName?: string,
    licensePlate?: string,
    document?: File,
    photo?: File
  ): Observable<VehicleResponse> {
    const formData = new FormData();
    if (modelName) {
      formData.append('modelName', modelName);
    }
    if (licensePlate) {
      formData.append('licensePlate', licensePlate);
    }
    if (document) {
      formData.append('document', document);
    }
    if (photo) {
      formData.append('photo', photo);
    }
    return this.http.put<VehicleResponse>(`${this.API_URL}/${vehicleId}`, formData);
  }

  /**
   * Deleta um veículo
   */
  deleteVehicle(vehicleId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${vehicleId}`);
  }

  /**
   * Retorna a URL da foto do veículo
   */
  getVehiclePhotoUrl(vehicleId: string): string {
    return `${this.API_URL}/${vehicleId}/photo`;
  }

  /**
   * Retorna a URL do documento do veículo
   */
  getVehicleDocumentUrl(vehicleId: string): string {
    return `${this.API_URL}/${vehicleId}/document`;
  }
}

