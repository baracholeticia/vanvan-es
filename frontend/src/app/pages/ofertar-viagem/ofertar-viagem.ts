import { Component, HostListener, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Toggle } from '../../components/toggle/toggle';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast/toast.service';

export interface TripOffer {
  // Partida (Departure)
  departureCity: string;
  departureLocation: string;
  departureReference: string;

  // Destino (Destination)
  destinationCity: string;
  destinationLocation: string;
  destinationReference: string;

  // Data e Horário
  date: string;
  time: string;

  // Veículo selecionado
  selectedVehicleId: string | null;

  // Pricing (Step 3)
  availableSeats: string;
  customPrice: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  image: string;
}

export interface PastTrip {
  id: number;
  origin: string;
  destination: string;
  price: string;
  distance: string;
  date: string;
  time: string;
}

export interface RepeatDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
}

@Component({
  selector: 'app-ofertar-viagem',
  standalone: true,
  imports: [CommonModule, FormsModule, Toggle],
  templateUrl: './ofertar-viagem.html',
  styleUrls: ['./ofertar-viagem.css']
})
export class OfertarViagem {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    // Usar effect para reagir quando o usuário for carregado
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.vehiclesLoaded) {
        this.vehiclesLoaded = true;
        this.loadVehiclesForUser(user.id);
      }
    });

    // Verificar se há query params para preencher o formulário (repetir viagem)
    this.route.queryParams.subscribe(params => {
      if (params['departureCity']) {
        this.tripOffer.departureCity = params['departureCity'] || '';
        this.tripOffer.departureLocation = params['departureLocation'] || '';
        this.tripOffer.departureReference = params['departureReference'] || '';
        this.tripOffer.destinationCity = params['destinationCity'] || '';
        this.tripOffer.destinationLocation = params['destinationLocation'] || '';
        this.tripOffer.destinationReference = params['destinationReference'] || '';
        this.cdr.detectChanges();
      }
    });
  }

  // ===== Card State Management =====
  currentStep: 'form' | 'vehicles' | 'pricing' = 'form';
  showHistoryCard = false;
  showRepeatCard = false;
  selectedTripForRepeat: PastTrip | null = null;

  // ===== Pricing State =====
  suggestedPrice = 'R$40,00';
  suggestedDistance = '70km';
  changePrice = false;

  // ===== Form Data =====
  tripOffer: TripOffer = {
    departureCity: '',
    departureLocation: '',
    departureReference: '',
    destinationCity: '',
    destinationLocation: '',
    destinationReference: '',
    date: '',
    time: '',
    selectedVehicleId: null,
    availableSeats: '',
    customPrice: ''
  };

  // ===== Vehicles =====
  vehicles: Vehicle[] = [];
  isLoadingVehicles = true; // Começa como true
  private vehiclesLoaded = false;

  private loadVehiclesForUser(userId: string): void {
    this.isLoadingVehicles = true;

    this.vehicleService.getVehiclesByDriver(userId).subscribe({
      next: (response) => {
        this.vehicles = response.map(v => ({
          id: v.id,
          name: v.modelName,
          plate: v.licensePlate,
          image: v.photoPath ? this.vehicleService.getVehiclePhotoUrl(v.id) : 'assets/VAN-EMPTY.png'
        }));
        // Auto-selecionar o primeiro veículo se houver apenas um
        if (this.vehicles.length === 1) {
          this.tripOffer.selectedVehicleId = this.vehicles[0].id;
        }
        this.isLoadingVehicles = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar veículos:', err);
        this.errorMessage = 'Erro ao carregar veículos. Tente novamente.';
        this.isLoadingVehicles = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===== Past Trips (for history) =====
  pastTrips: PastTrip[] = [
    {
      id: 1,
      origin: 'Garanhuns',
      destination: 'Recife',
      price: 'R$400,00',
      distance: '60km',
      date: '10 Fev',
      time: '08:00'
    },
    {
      id: 2,
      origin: 'Garanhuns',
      destination: 'Recife',
      price: 'R$400,00',
      distance: '60km',
      date: '10 Fev',
      time: '08:00'
    }
  ];

  // ===== Repeat Days =====
  repeatDays: RepeatDays = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false
  };

  // ===== Form Validation State =====
  isLoading = false;
  errorMessage = '';

  // ===== Click Outside Handler =====
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is outside the cards area
    const cardsContainer = target.closest('.cards-container');
    const historyButton = target.closest('.history-button');
    const repeatButton = target.closest('.repeat-button');

    // Don't close if clicking on history button, repeat button, or inside cards
    if (historyButton || repeatButton || cardsContainer) {
      return;
    }

    // Close history and repeat cards when clicking outside
    if (this.showHistoryCard || this.showRepeatCard) {
      this.closeAllSideCards();
    }
  }

  // ===== Navigation =====
  goToHistory(): void {
    this.showHistoryCard = !this.showHistoryCard;
    if (!this.showHistoryCard) {
      this.showRepeatCard = false;
      this.selectedTripForRepeat = null;
    }
  }

  closeAllSideCards(): void {
    this.showHistoryCard = false;
    this.showRepeatCard = false;
    this.selectedTripForRepeat = null;
  }

  goBack(): void {
    if (this.currentStep === 'pricing') {
      this.currentStep = 'vehicles';
    } else if (this.currentStep === 'vehicles') {
      this.currentStep = 'form';
    } else {
      this.router.navigate(['/motorista']);
    }
  }

  // ===== Form Submission =====
  onNext(): void {
    if (this.currentStep === 'form') {
      if (!this.isFormValid()) {
        this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
        return;
      }
      this.errorMessage = '';
      this.currentStep = 'vehicles';
    } else if (this.currentStep === 'vehicles') {
      if (!this.tripOffer.selectedVehicleId) {
        this.errorMessage = 'Por favor, selecione um veículo.';
        return;
      }
      this.errorMessage = '';
      this.currentStep = 'pricing';
    } else if (this.currentStep === 'pricing') {
      if (!this.tripOffer.availableSeats || parseInt(this.tripOffer.availableSeats) <= 0) {
        this.errorMessage = 'Por favor, informe a quantidade de assentos.';
        return;
      }
      this.submitTrip();
    }
  }

  submitTrip(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // TODO: Implement API call to create trip offer
    console.log('Trip offer data:', this.tripOffer);

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.toastService.success('Viagem ofertada com sucesso!');
      this.router.navigate(['/motorista']);
    }, 1000);
  }

  // ===== Vehicle Selection =====
  selectVehicle(vehicleId: string): void {
    this.tripOffer.selectedVehicleId = vehicleId;
    this.errorMessage = '';
  }

  // ===== Repeat Trip =====
  openRepeatCard(trip: PastTrip): void {
    this.selectedTripForRepeat = trip;
    this.showRepeatCard = true;
    // Reset days to default
    this.repeatDays = {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false
    };
  }

  saveRepeatTrip(): void {
    if (!this.selectedTripForRepeat) return;

    console.log('Saving repeat trip:', {
      trip: this.selectedTripForRepeat,
      days: this.repeatDays
    });

    // TODO: Implement API call to save repeat trip

    // Close cards after saving
    this.showRepeatCard = false;
    this.selectedTripForRepeat = null;
  }

  verMaisViagens(): void {
    console.log('Ver mais viagens');
    // TODO: Implement load more trips
  }

  // ===== Validation =====
  isFormValid(): boolean {
    return !!(
      this.tripOffer.departureCity &&
      this.tripOffer.departureLocation &&
      this.tripOffer.destinationCity &&
      this.tripOffer.destinationLocation &&
      this.tripOffer.date &&
      this.tripOffer.time
    );
  }

  // ===== Date/Time Formatting =====
  formatDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }

    this.tripOffer.date = value.slice(0, 10);
  }

  formatTime(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }

    this.tripOffer.time = value.slice(0, 5);
  }
}
