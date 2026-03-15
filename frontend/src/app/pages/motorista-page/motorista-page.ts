import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../components/toast/toast.service';
import { RatingService } from '../../services/rating.service';

type TripStatus = 'none' | 'scheduled' | 'in_progress' | 'arriving' | 'completed';

@Component({
  selector: 'app-motorista-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motorista-page.html',
  styleUrls: ['./motorista-page.css']
})
export class MotoristaPage implements OnInit, OnDestroy {

  driverRating = { averageScore: 0, totalRatings: 0 };

  constructor(
    private router: Router,
    private toastService: ToastService,
    private ratingService: RatingService
  ) {}

  ngOnInit(): void {
    this.ratingService.getDriverMediaAvaliacao().subscribe({
      next: (rating) => {
        this.driverRating = rating;
      },
      error: (err) => {
        console.error('Erro ao buscar notas do motorista:', err);
      }
    });
  }


  // ===== Trip Status =====
  tripStatus: TripStatus = 'scheduled'; // Estado padrão com viagem agendada

  // ===== Timer =====
  elapsedTime = 0; // em segundos
  private timerInterval: any = null;

  // ===== Progress =====
  tripProgress = 0; // 0-100
  estimatedArrival = '';
  distanceTraveled = '0km';
  distanceRemaining = '230km';

  // ===== Current Trip =====
  // Dados de exemplo - quando integrar com backend, pode ser null para mostrar estado 'none'
  currentTrip: any = {
    availableSeats: 14,
    confirmedPassengers: 12,
    origin: 'Garanhuns',
    destination: 'Recife',
    distance: '230km',
    distanceNum: 230,
    departureLocation: 'Rodoviária - Garanhuns',
    arrivalLocation: 'Rodoviária - Recife',
    date: '10 Fev',
    time: '08:00',
    pricePerSeat: 45.00,
  };

  // Dados de exemplo para quando tiver viagem (backup)
  private sampleTrip = {
    availableSeats: 14,
    confirmedPassengers: 12,
    origin: 'Garanhuns',
    destination: 'Recife',
    distance: '230km',
    distanceNum: 230,
    departureLocation: 'Rodoviária - Garanhuns',
    arrivalLocation: 'Rodoviária - Recife',
    date: '10 Fev',
    time: '08:00',
    pricePerSeat: 45.00,
  };

  // ===== Passengers (para viagem em andamento) =====
  passengers = [
    { name: 'Maria Silva', status: 'confirmed', seat: 1 },
    { name: 'João Santos', status: 'confirmed', seat: 2 },
    { name: 'Ana Costa', status: 'confirmed', seat: 3 },
    { name: 'Pedro Lima', status: 'confirmed', seat: 4 },
    { name: 'Carla Souza', status: 'confirmed', seat: 5 },
  ];

  // ===== Quick Actions During Trip =====
  showEmergencyPopup = false;
  showPassengersPopup = false;

  // Seat management
  adjustSeats(delta: number): void {
    if (!this.currentTrip) return;
    const newVal = this.currentTrip.availableSeats + delta;
    if (newVal >= 0) {
      this.currentTrip.availableSeats = newVal;
    }
  }

  saveSeats(): void {
    if (!this.currentTrip) return;
    this.toastService.success('Assentos atualizados com sucesso!');
  }

  cancelCurrentTrip(): void {
    if (this.tripStatus === 'in_progress') {
      this.resetTrip();
      this.toastService.error('Viagem em andamento cancelada');
    } else {
      this.resetTrip();
      this.toastService.success('Viagem cancelada');
    }
  }

  startTrip(): void {
    if (!this.currentTrip) return;
    this.tripStatus = 'in_progress';
    this.elapsedTime = 0;
    this.tripProgress = 0;
    this.estimatedArrival = this.calculateEstimatedArrival();
    this.distanceTraveled = '0km';
    this.distanceRemaining = this.currentTrip.distance;

    this.toastService.success('Viagem iniciada! Boa viagem!');

    // Iniciar cronômetro
    this.timerInterval = setInterval(() => {
      this.elapsedTime++;
      this.updateTripProgress();
    }, 1000);
  }

  pauseTrip(): void {
    // Pausar/retomar cronômetro
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    } else {
      this.timerInterval = setInterval(() => {
        this.elapsedTime++;
        this.updateTripProgress();
      }, 1000);
    }
  }

  finishTrip(): void {
    this.tripStatus = 'completed';
    this.tripProgress = 100;
    this.distanceTraveled = this.currentTrip.distance;
    this.distanceRemaining = '0km';

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.toastService.success('Viagem finalizada com sucesso!');

    // Mostrar resumo após 5 segundos
    setTimeout(() => {
      this.resetTrip();
    }, 5000);
  }

  private resetTrip(): void {
    // TODO: Quando integrar com backend, usar 'none' se não houver próxima viagem
    this.tripStatus = 'scheduled';
    // Restaurar dados de exemplo
    this.currentTrip = { ...this.sampleTrip };
    this.elapsedTime = 0;
    this.tripProgress = 0;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTripProgress(): void {
    if (!this.currentTrip) return;

    // Simular progresso baseado no tempo (para demo)
    // Em produção, seria baseado em GPS
    const estimatedTripDuration = 180 * 60; // 3 horas em segundos
    this.tripProgress = Math.min((this.elapsedTime / estimatedTripDuration) * 100, 99);

    // Atualizar distâncias
    const traveled = (this.tripProgress / 100) * this.currentTrip.distanceNum;
    const remaining = this.currentTrip.distanceNum - traveled;
    this.distanceTraveled = `${Math.round(traveled)}km`;
    this.distanceRemaining = `${Math.round(remaining)}km`;

    // Verificar se está chegando (90%+)
    if (this.tripProgress >= 90 && this.tripStatus === 'in_progress') {
      this.tripStatus = 'arriving';
    }
  }

  private calculateEstimatedArrival(): string {
    const now = new Date();
    const arrival = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 horas
    return `${arrival.getHours().toString().padStart(2, '0')}:${arrival.getMinutes().toString().padStart(2, '0')}`;
  }

  get formattedElapsedTime(): string {
    const hours = Math.floor(this.elapsedTime / 3600);
    const minutes = Math.floor((this.elapsedTime % 3600) / 60);
    const seconds = this.elapsedTime % 60;

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get isPaused(): boolean {
    return this.timerInterval === null && this.tripStatus === 'in_progress';
  }

  get totalEarnings(): string {
    if (!this.currentTrip) return 'R$0,00';
    const total = this.currentTrip.confirmedPassengers * this.currentTrip.pricePerSeat;
    return `R$${total.toFixed(2).replace('.', ',')}`;
  }

  togglePassengersPopup(): void {
    this.showPassengersPopup = !this.showPassengersPopup;
    this.showEmergencyPopup = false;
  }

  toggleEmergencyPopup(): void {
    this.showEmergencyPopup = !this.showEmergencyPopup;
    this.showPassengersPopup = false;
  }

  callEmergency(): void {
    this.toastService.success('Acionando emergência médica (192)...');
    this.toggleEmergencyPopup();
  }

  reportProblem(): void {
    this.toastService.success('Abrindo formulário de reporte...');
    this.toggleEmergencyPopup();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // ===== Past Trips =====
  pastTrips = [
    {
      origin: 'Garanhuns',
      destination: 'Recife',
      price: 'R$400,00',
      distance: '60km',
      date: '10 Fev',
      time: '08:00',
    },
  ];

  // ===== Report Data =====
  report = {
    days: 7,
    tripsCompleted: 16,
    months: 1,
    profit: 'R$2300,00',
    dailyProfits: [42, 73, 59, 51, 67, 100],
    dailyLabels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    dailyValues: [105, 183, 148, 128, 168, 250],
  };

  verFaturamento(): void {
    this.router.navigate(['/faturamento']);
  }

  // ===== Pricing =====
  pricing = {
    ratePerKm: 'R$0,70/km',
    routes: [
      { distance: '50km', price: 'R$35,00' },
      { distance: '100km', price: 'R$70,00' },
    ],
  };

  // ===== Navigation =====
  ofertarViagem(): void {
    this.router.navigate(['/ofertar-viagem']);
  }

  verMaisViagens(): void {
    this.router.navigate(['/viagens-motorista']);
  }

  alterarValores(): void {
    this.router.navigate(['/ajustar-valores']);
  }

  editarVeiculo(): void {
    this.router.navigate(['/seu-veiculo']);
  }
}
