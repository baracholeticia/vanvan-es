import { Component, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface PastTrip {
  id: string;
  origin: string;
  originLocation: string;
  originReference: string;
  destination: string;
  destinationLocation: string;
  destinationReference: string;
  price: string;
  distance: string;
  date: string;
  time: string;
  passengers: number;
  status: 'completed' | 'cancelled';
  vehicleName: string;
  vehiclePlate: string;
}

@Component({
  selector: 'app-viagens-motorista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viagens-motorista.html',
  styleUrls: ['./viagens-motorista.css']
})
export class ViagensMotorista {

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    // Carregar viagens quando o usuário estiver disponível
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.tripsLoaded) {
        this.tripsLoaded = true;
        this.loadTrips(user.id);
      }
    });
  }

  // ===== State =====
  isLoading = true;
  errorMessage = '';
  private tripsLoaded = false;

  // ===== Filter =====
  selectedFilter: 'all' | 'completed' | 'cancelled' = 'all';

  // ===== Trips Data =====
  // TODO: Substituir por dados da API quando disponível
  pastTrips: PastTrip[] = [
    {
      id: '1',
      origin: 'Garanhuns',
      originLocation: 'Rodoviária de Garanhuns',
      originReference: 'Em frente ao relógio das flores',
      destination: 'Recife',
      destinationLocation: 'Terminal Integrado de Passageiros',
      destinationReference: 'TIP - Recife',
      price: 'R$45,00',
      distance: '230km',
      date: '10/02/2026',
      time: '08:00',
      passengers: 12,
      status: 'completed',
      vehicleName: 'Mercedes-Benz Sprinter 2022',
      vehiclePlate: 'ABC1D23'
    },
    {
      id: '2',
      origin: 'Recife',
      originLocation: 'Terminal Integrado de Passageiros',
      originReference: 'TIP - Recife',
      destination: 'Garanhuns',
      destinationLocation: 'Rodoviária de Garanhuns',
      destinationReference: 'Em frente ao relógio das flores',
      price: 'R$45,00',
      distance: '230km',
      date: '10/02/2026',
      time: '14:00',
      passengers: 8,
      status: 'completed',
      vehicleName: 'Mercedes-Benz Sprinter 2022',
      vehiclePlate: 'ABC1D23'
    },
    {
      id: '3',
      origin: 'Garanhuns',
      originLocation: 'Rodoviária de Garanhuns',
      originReference: 'Em frente ao relógio das flores',
      destination: 'Caruaru',
      destinationLocation: 'Rodoviária de Caruaru',
      destinationReference: 'Centro',
      price: 'R$30,00',
      distance: '120km',
      date: '08/02/2026',
      time: '07:00',
      passengers: 14,
      status: 'completed',
      vehicleName: 'Mercedes-Benz Sprinter 2022',
      vehiclePlate: 'ABC1D23'
    },
    {
      id: '4',
      origin: 'Garanhuns',
      originLocation: 'Rodoviária de Garanhuns',
      originReference: 'Em frente ao relógio das flores',
      destination: 'Maceió',
      destinationLocation: 'Terminal Rodoviário de Maceió',
      destinationReference: 'Centro',
      price: 'R$55,00',
      distance: '280km',
      date: '05/02/2026',
      time: '06:00',
      passengers: 0,
      status: 'cancelled',
      vehicleName: 'Mercedes-Benz Sprinter 2022',
      vehiclePlate: 'ABC1D23'
    },
    {
      id: '5',
      origin: 'Caruaru',
      originLocation: 'Rodoviária de Caruaru',
      originReference: 'Centro',
      destination: 'Recife',
      destinationLocation: 'Terminal Integrado de Passageiros',
      destinationReference: 'TIP - Recife',
      price: 'R$25,00',
      distance: '130km',
      date: '03/02/2026',
      time: '09:00',
      passengers: 10,
      status: 'completed',
      vehicleName: 'Mercedes-Benz Sprinter 2022',
      vehiclePlate: 'ABC1D23'
    }
  ];

  // ===== Computed =====
  get filteredTrips(): PastTrip[] {
    if (this.selectedFilter === 'all') {
      return this.pastTrips;
    }
    return this.pastTrips.filter(trip => trip.status === this.selectedFilter);
  }

  get completedTripsCount(): number {
    return this.pastTrips.filter(trip => trip.status === 'completed').length;
  }

  get cancelledTripsCount(): number {
    return this.pastTrips.filter(trip => trip.status === 'cancelled').length;
  }

  get totalEarnings(): string {
    const total = this.pastTrips
      .filter(trip => trip.status === 'completed')
      .reduce((sum, trip) => {
        const value = parseFloat(trip.price.replace('R$', '').replace(',', '.'));
        return sum + (value * trip.passengers);
      }, 0);
    return `R$${total.toFixed(2).replace('.', ',')}`;
  }

  // ===== Methods =====
  private loadTrips(userId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    // TODO: Implementar chamada à API quando disponível
    // this.tripService.getDriverTrips(userId).subscribe({...})

    // Simulando carregamento
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 500);
  }

  setFilter(filter: 'all' | 'completed' | 'cancelled'): void {
    this.selectedFilter = filter;
  }

  repeatTrip(trip: PastTrip): void {
    // Navegar para ofertar viagem com os dados preenchidos
    this.router.navigate(['/ofertar-viagem'], {
      queryParams: {
        departureCity: trip.origin,
        departureLocation: trip.originLocation,
        departureReference: trip.originReference,
        destinationCity: trip.destination,
        destinationLocation: trip.destinationLocation,
        destinationReference: trip.destinationReference
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/motorista']);
  }

  formatDate(dateStr: string): { day: string; month: string } {
    const parts = dateStr.split('/');
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return {
      day: parts[0],
      month: months[parseInt(parts[1]) - 1] || ''
    };
  }
}

