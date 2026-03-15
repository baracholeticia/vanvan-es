import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, PricingConfig, DriverOption } from '../../services/settings.service';
import { TripStatus, TRIP_STATUS_LABEL } from './trip-status.enum';

export interface PassengerDTO {
  id: string;
  name: string;
}

export interface TripDetailsDTO {
  id?: number;
  date: string;
  time: string;
  driverName: string;
  passengers: PassengerDTO[];
  departureCity: string;
  arrivalCity: string;
  totalAmount: number;
  status: string;
}

const MOCK_TRIPS: TripDetailsDTO[] = [
  {
    id: 1,
    date: '2026-03-10',
    time: '08:00',
    driverName: 'João Silva',
    departureCity: 'Garanhuns',
    arrivalCity: 'Recife',
    totalAmount: 120.00,
    status: 'COMPLETED',
    passengers: [
      { id: 'uuid-1', name: 'Maria Souza' },
      { id: 'uuid-2', name: 'Pedro Santos' },
      { id: 'uuid-3', name: 'Ana Beatriz' }
    ]
  },
  {
    id: 2,
    date: '2026-03-11',
    time: '14:30',
    driverName: 'Carlos Oliveira',
    departureCity: 'Recife',
    arrivalCity: 'Caruaru',
    totalAmount: 0.00,
    status: 'SCHEDULED',
    passengers: []
  },
  {
    id: 3,
    date: '2026-03-05',
    time: '09:15',
    driverName: 'Fernanda Lima',
    departureCity: 'Caruaru',
    arrivalCity: 'Garanhuns',
    totalAmount: 200.00,
    status: 'COMPLETED',
    passengers: [
      { id: 'uuid-4', name: 'Lucas Ferreira' },
      { id: 'uuid-5', name: 'Juliana Costa' }
    ]
  },
  {
    id: 4,
    date: '2026-03-12',
    time: '18:00',
    driverName: 'Marcos Antônio',
    departureCity: 'Garanhuns',
    arrivalCity: 'Maceió',
    totalAmount: 40.00,
    status: 'CANCELLED',
    passengers: [{ id: 'uuid-6', name: 'Roberto Carlos' }]
  }
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html'
})
export class SettingsComponent implements OnInit {

  searchQuery = '';
  newOrigin = '';
  newDestination = '';
  distance = 63;

  pricing: PricingConfig = {
    minimumFare: 0,
    perKmRate: 0,
    cancellationFee: 0,
    commissionRate: 0
  };

  readonly statusOptions = Object.values(TripStatus);
  readonly statusLabel: Record<string, string> = TRIP_STATUS_LABEL;

  availableDrivers: DriverOption[] = [];
  loadingDrivers = false;

  private _trips = signal<TripDetailsDTO[]>([]);

  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showPassengersModal = false;

  newTripDriverId = '';
  newTripDate = '';
  newTripTime = '';

  editTrip: TripDetailsDTO = this.emptyTrip();
  selectedTrip: TripDetailsDTO | null = null;
  selectedTripPassengers: PassengerDTO[] = [];

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.carregarDados();
    this.carregarMotoristas();
  }

  private emptyTrip(): TripDetailsDTO {
    return {
      date: '', time: '', driverName: '',
      passengers: [], departureCity: '', arrivalCity: '',
      totalAmount: 0, status: TripStatus.SCHEDULED
    };
  }

  carregarDados(): void {
    this._trips.set(MOCK_TRIPS);

    this.settingsService.obterTarifaAtual().subscribe({
      next: (config) => { this.pricing = config; },
      error: (err: unknown) => console.error('Erro ao carregar tarifa', err)
    });
  }

  carregarMotoristas(): void {
    this.loadingDrivers = true;
    this.settingsService.listarMotoristas().subscribe({
      next: (page) => {
        this.availableDrivers = page.content;
        this.loadingDrivers = false;
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar motoristas', err);
        this.loadingDrivers = false;
      }
    });
  }

  trips = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this._trips().filter(t =>
      t.departureCity?.toLowerCase().includes(q) ||
      t.arrivalCity?.toLowerCase().includes(q) ||
      t.driverName?.toLowerCase().includes(q)
    );
  });

  get estimatedValue(): number {
    return this.distance * this.pricing.perKmRate;
  }

  openAddModal(): void {
    if (!this.newOrigin || !this.newDestination) {
      alert('Preencha a cidade de origem e destino antes de adicionar uma viagem.');
      return;
    }
    this.newTripDriverId = '';
    this.newTripDate = '';
    this.newTripTime = '';
    this.showAddModal = true;
  }

  confirmAddTrip(): void {
    if (!this.newTripDriverId || !this.newTripDate || !this.newTripTime) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    const driver = this.availableDrivers.find(d => d.id === this.newTripDriverId);
    const novaViagem: TripDetailsDTO = {
      id: Date.now(),
      date: this.newTripDate,
      time: this.newTripTime,
      driverName: driver?.name ?? '',
      departureCity: this.newOrigin,
      arrivalCity: this.newDestination,
      totalAmount: this.estimatedValue,
      status: TripStatus.SCHEDULED,
      passengers: []
    };
    this._trips.update(l => [...l, novaViagem]);
    this.newOrigin = '';
    this.newDestination = '';
    this.closeModals();
  }

  openEditModal(trip: TripDetailsDTO): void {
    this.editTrip = { ...trip, passengers: [...(trip.passengers ?? [])] };
    this.showEditModal = true;
  }

  confirmSaveEdit(): void {
    if (!this.editTrip.departureCity || !this.editTrip.arrivalCity) {
      alert('Preencha origem e destino.');
      return;
    }
    this._trips.update(l =>
      l.map(t => t.id === this.editTrip.id ? { ...this.editTrip } : t)
    );
    this.closeModals();
  }

  openDeleteModal(trip: TripDetailsDTO): void {
    this.selectedTrip = trip;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedTrip?.id) return;
    this._trips.update(l => l.filter(t => t.id !== this.selectedTrip!.id));
    this.closeModals();
  }

  openPassengersModal(trip: TripDetailsDTO): void {
    this.selectedTrip = trip;
    this.selectedTripPassengers = trip.passengers ?? [];
    this.showPassengersModal = true;
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showPassengersModal = false;
    this.selectedTrip = null;
    this.selectedTripPassengers = [];
  }

  saveRate(): void {
    if (
      this.pricing.perKmRate <= 0 ||
      this.pricing.minimumFare <= 0 ||
      this.pricing.cancellationFee <= 0 ||
      this.pricing.commissionRate <= 0
    ) {
      alert('Preencha todos os campos de tarifa com valores válidos.');
      return;
    }
    this.settingsService.atualizarTarifa(this.pricing).subscribe({
      next: (saved) => {
        this.pricing = saved;
        alert('Tarifas salvas com sucesso!');
      },
      error: (err: unknown) => {
        console.error('Erro ao salvar tarifa', err);
        alert('Erro ao salvar as tarifas no servidor.');
      }
    });
  }
}