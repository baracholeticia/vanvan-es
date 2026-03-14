import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Rating {
  id: string;
  score: number;
  comment: string;
  clientName: string;
  driverName: string;
  tripId: string;
  date: string;
  reviewed: boolean; // Moderation flag: if Admin has seen/treated this
  hidden: boolean;   // Moderation flag: if comment is hidden
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  // MOCK DATA
  private mockRatings: Rating[] = [
    {
      id: '1',
      score: 5,
      comment: 'Viagem excelente! O motorista foi super educado e o carro estava bem limpo.',
      clientName: 'Maria Silva',
      driverName: 'João Souza',
      tripId: 'TRP-1001',
      date: '2023-11-20T14:30:00Z',
      reviewed: false,
      hidden: false
    },
    {
      id: '2',
      score: 2,
      comment: 'O motorista se atrasou 20 minutos e dirigiu muito rápido.',
      clientName: 'Carlos Mendonça',
      driverName: 'Pedro Alves',
      tripId: 'TRP-1002',
      date: '2023-11-21T09:15:00Z',
      reviewed: false,
      hidden: false
    },
    {
      id: '3',
      score: 4,
      comment: 'Tudo certo, mas o ar condicionado estava fraco.',
      clientName: 'Ana Beatriz',
      driverName: 'João Souza',
      tripId: 'TRP-1003',
      date: '2023-11-22T18:45:00Z',
      reviewed: true,
      hidden: false
    },
    {
      id: '4',
      score: 1,
      comment: 'Palavras ofensivas e conduta inapropriada. (Comentário original)',
      clientName: 'Roberto Dias',
      driverName: 'Marcos Silva',
      tripId: 'TRP-1004',
      date: '2023-11-23T22:10:00Z',
      reviewed: true,
      hidden: true // Admin hid this comment
    },
    {
      id: '5',
      score: 5,
      comment: 'Perfeito, recomendo muito.',
      clientName: 'Juliana Costa',
      driverName: 'Pedro Alves',
      tripId: 'TRP-1005',
      date: '2023-11-24T08:00:00Z',
      reviewed: false,
      hidden: false
    }
  ];

  constructor() { }

  listar(filtroTexto?: string, status?: string): Observable<Rating[]> {
    let filtrados = [...this.mockRatings];

    // Texto livre (busca por cliente, motorista ou viagem)
    if (filtroTexto) {
      const termo = filtroTexto.toLowerCase();
      filtrados = filtrados.filter(r => 
        r.clientName.toLowerCase().includes(termo) ||
        r.driverName.toLowerCase().includes(termo) ||
        r.tripId.toLowerCase().includes(termo)
      );
    }

    // Filtro por status
    if (status) {
      if (status === 'negative') {
        filtrados = filtrados.filter(r => r.score <= 3);
      } else if (status === 'unreviewed') {
        filtrados = filtrados.filter(r => !r.reviewed);
      }
    }

    // Retorna ordenado pela data mais recente (decrescente)
    filtrados.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Simulando o delay de uma chamada HTTP real
    return of(filtrados).pipe(delay(400));
  }

  marcarComoAnalisado(id: string): Observable<Rating> {
    const rating = this.mockRatings.find(r => r.id === id);
    if (rating) {
      rating.reviewed = true;
    }
    return of(rating!).pipe(delay(200));
  }

  ocultarComentario(id: string): Observable<Rating> {
    const rating = this.mockRatings.find(r => r.id === id);
    if (rating) {
      rating.hidden = true;
    }
    return of(rating!).pipe(delay(200));
  }
}
