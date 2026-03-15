import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/pagination.model';

export interface Rating {
  id: number;
  tripId: number;
  driverId: string;
  driverName: string;
  passengerId: string;
  passengerName: string;
  score: number;
  comment: string;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
}

export interface RatingStatusUpdate {
  status: 'VISIBLE' | 'HIDDEN';
}

export interface DriverAverageRating {
  averageScore: number;
  totalRatings: number;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/ratings`;

  listar(status?: string, page: number = 0, size: number = 100): Observable<PageResponse<Rating>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status.toUpperCase()); // Either VISIBLE or HIDDEN
    }

    return this.http.get<PageResponse<Rating>>(`${this.apiUrl}/admin`, { params });
  }

  ocultarComentario(id: number): Observable<Rating> {
    const body: RatingStatusUpdate = { status: 'HIDDEN' };
    return this.http.patch<Rating>(`${this.apiUrl}/admin/${id}/status`, body);
  }

  getDriverMediaAvaliacao(): Observable<DriverAverageRating> {
    return this.http.get<DriverAverageRating>(`${this.apiUrl}/me/average`);
  }
}
