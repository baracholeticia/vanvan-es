import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, afterEach, MockInstance } from 'vitest';
import { of, throwError } from 'rxjs';
import { SettingsComponent, TripDetailsDTO } from './settings';
import { SettingsService, PricingConfig, SpringPage, DriverOption } from '../../services/settings.service';

const mockPricing: PricingConfig = {
  minimumFare: 10,
  perKmRate: 1.5,
  cancellationFee: 2.5,
  commissionRate: 15
};

const mockDriversPage: SpringPage<DriverOption> = {
  content: [
    { id: 'uuid-driver-1', name: 'João Silva' },
    { id: 'uuid-driver-2', name: 'Maria Lima' }
  ],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 100
};

// Tipagem explícita para que vi.fn() exponha mockReturnValue sem ambiguidade
interface SettingsServiceMock {
  obterTarifaAtual: ReturnType<typeof vi.fn>;
  listarMotoristas: ReturnType<typeof vi.fn>;
  atualizarTarifa: ReturnType<typeof vi.fn>;
  excluirTrecho: ReturnType<typeof vi.fn>;
}

function makeSettingsServiceMock(): SettingsServiceMock {
  return {
    obterTarifaAtual: vi.fn().mockReturnValue(of(mockPricing)),
    listarMotoristas: vi.fn().mockReturnValue(of(mockDriversPage)),
    atualizarTarifa: vi.fn().mockReturnValue(of(mockPricing)),
    excluirTrecho: vi.fn().mockReturnValue(of(undefined))
  };
}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let settingsServiceMock: SettingsServiceMock;

  beforeEach(() => {
    settingsServiceMock = makeSettingsServiceMock();
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, SettingsComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceMock }
      ]
    });
    component = TestBed.createComponent(SettingsComponent).componentInstance;
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ─── Inicialização ────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should load pricing on init', () => {
      component.ngOnInit();
      expect(settingsServiceMock.obterTarifaAtual).toHaveBeenCalled();
      expect(component.pricing).toEqual(mockPricing);
    });

    it('should load drivers on init', () => {
      component.ngOnInit();
      expect(settingsServiceMock.listarMotoristas).toHaveBeenCalled();
      expect(component.availableDrivers.length).toBe(2);
      expect(component.availableDrivers[0].name).toBe('João Silva');
    });

    it('should set loadingDrivers=false after drivers load', () => {
      component.ngOnInit();
      expect(component.loadingDrivers).toBe(false);
    });

    it('should set loadingDrivers=false even on error', () => {
      settingsServiceMock.listarMotoristas.mockReturnValue(throwError(() => new Error('network')));
      component.ngOnInit();
      expect(component.loadingDrivers).toBe(false);
    });
  });

  // ─── estimatedValue ──────────────────────────────────────────────────────

  describe('estimatedValue', () => {
    it('should calculate distance * perKmRate', () => {
      component.pricing = { ...mockPricing, perKmRate: 2 };
      component.distance = 100;
      expect(component.estimatedValue).toBe(200);
    });

    it('should return 0 when perKmRate is 0', () => {
      component.pricing = { ...mockPricing, perKmRate: 0 };
      expect(component.estimatedValue).toBe(0);
    });
  });

  // ─── Filtro de pesquisa ───────────────────────────────────────────────────

  describe('trips (computed filter)', () => {
    beforeEach(() => component.ngOnInit());

    it('should return all trips when searchQuery is empty', () => {
      component.searchQuery = '';
      expect(component.trips().length).toBe(4);
    });

    it('should filter by driverName (case insensitive)', () => {
      component.searchQuery = 'joão';
      const result = component.trips();
      expect(result.every(t => t.driverName.toLowerCase().includes('joão'))).toBe(true);
    });

    it('should filter by departureCity', () => {
      component.searchQuery = 'recife';
      const result = component.trips();
      expect(result.every(t =>
        t.departureCity.toLowerCase().includes('recife') ||
        t.arrivalCity.toLowerCase().includes('recife') ||
        t.driverName.toLowerCase().includes('recife')
      )).toBe(true);
    });

    it('should return empty array for unmatched query', () => {
      component.searchQuery = 'xyznotexists';
      expect(component.trips().length).toBe(0);
    });
  });

  // ─── Modal: Adicionar ─────────────────────────────────────────────────────

  describe('openAddModal', () => {
    it('should open modal when origin and destination are set', () => {
      component.newOrigin = 'Garanhuns';
      component.newDestination = 'Recife';
      component.openAddModal();
      expect(component.showAddModal).toBe(true);
    });

    it('should NOT open modal when origin is empty', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.newOrigin = '';
      component.newDestination = 'Recife';
      component.openAddModal();
      expect(component.showAddModal).toBe(false);
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should NOT open modal when destination is empty', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.newOrigin = 'Garanhuns';
      component.newDestination = '';
      component.openAddModal();
      expect(component.showAddModal).toBe(false);
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should reset form fields when opening', () => {
      component.newOrigin = 'A';
      component.newDestination = 'B';
      component.newTripDriverId = 'old-id';
      component.newTripDate = '2026-01-01';
      component.newTripTime = '10:00';
      component.openAddModal();
      expect(component.newTripDriverId).toBe('');
      expect(component.newTripDate).toBe('');
      expect(component.newTripTime).toBe('');
    });
  });

  describe('confirmAddTrip', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.newOrigin = 'Garanhuns';
      component.newDestination = 'Recife';
      component.newTripDriverId = 'uuid-driver-1';
      component.newTripDate = '2026-04-01';
      component.newTripTime = '08:00';
    });

    it('should add trip to list and close modal', () => {
      const before = component.trips().length;
      component.confirmAddTrip();
      expect(component.trips().length).toBe(before + 1);
      expect(component.showAddModal).toBe(false);
    });

    it('should use selected driver name', () => {
      component.confirmAddTrip();
      const added = component.trips().find(t => t.driverName === 'João Silva');
      expect(added).toBeTruthy();
    });

    it('should clear origin and destination after adding', () => {
      component.confirmAddTrip();
      expect(component.newOrigin).toBe('');
      expect(component.newDestination).toBe('');
    });

    it('should alert and NOT add when driverId is missing', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.newTripDriverId = '';
      const before = component.trips().length;
      component.confirmAddTrip();
      expect(alertSpy).toHaveBeenCalled();
      expect(component.trips().length).toBe(before);
    });
  });

  // ─── Modal: Editar ────────────────────────────────────────────────────────

  describe('openEditModal / confirmSaveEdit', () => {
    const sampleTrip: TripDetailsDTO = {
      id: 1,
      date: '2026-03-10',
      time: '08:00',
      driverName: 'João Silva',
      departureCity: 'Garanhuns',
      arrivalCity: 'Recife',
      totalAmount: 120,
      status: 'COMPLETED',
      passengers: []
    };

    it('should copy trip into editTrip and open modal', () => {
      component.openEditModal(sampleTrip);
      expect(component.showEditModal).toBe(true);
      expect(component.editTrip.departureCity).toBe('Garanhuns');
    });

    it('should not mutate original trip (deep copy)', () => {
      component.openEditModal(sampleTrip);
      component.editTrip.departureCity = 'MUTATED';
      expect(sampleTrip.departureCity).toBe('Garanhuns');
    });

    it('should update trip in list after save', () => {
      component.ngOnInit();
      const original = component.trips().find(t => t.id === 1)!;
      component.openEditModal(original);
      component.editTrip.arrivalCity = 'Maceió';
      component.confirmSaveEdit();
      const updated = component.trips().find(t => t.id === 1)!;
      expect(updated.arrivalCity).toBe('Maceió');
    });

    it('should close modal after save', () => {
      component.openEditModal(sampleTrip);
      component.confirmSaveEdit();
      expect(component.showEditModal).toBe(false);
    });

    it('should alert when departureCity is empty', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.openEditModal(sampleTrip);
      component.editTrip.departureCity = '';
      component.confirmSaveEdit();
      expect(alertSpy).toHaveBeenCalled();
      expect(component.showEditModal).toBe(true);
    });
  });

  // ─── Modal: Excluir ───────────────────────────────────────────────────────

  describe('openDeleteModal / confirmDelete', () => {
    const sampleTrip: TripDetailsDTO = {
      id: 2,
      date: '2026-03-11',
      time: '14:30',
      driverName: 'Carlos',
      departureCity: 'Recife',
      arrivalCity: 'Caruaru',
      totalAmount: 0,
      status: 'SCHEDULED',
      passengers: []
    };

    it('should set selectedTrip and open delete modal', () => {
      component.openDeleteModal(sampleTrip);
      expect(component.showDeleteModal).toBe(true);
      expect(component.selectedTrip).toEqual(sampleTrip);
    });

    it('should remove trip from list', () => {
      component.ngOnInit();
      const before = component.trips().length;
      component.openDeleteModal(sampleTrip);
      component.confirmDelete();
      expect(component.trips().length).toBe(before - 1);
      expect(component.trips().find(t => t.id === 2)).toBeUndefined();
    });

    it('should close modal after delete', () => {
      component.openDeleteModal(sampleTrip);
      component.confirmDelete();
      expect(component.showDeleteModal).toBe(false);
      expect(component.selectedTrip).toBeNull();
    });
  });

  // ─── Modal: Passageiros ───────────────────────────────────────────────────

  describe('openPassengersModal', () => {
    it('should set selectedTripPassengers from trip', () => {
      const trip: TripDetailsDTO = {
        id: 1, date: '', time: '', driverName: '',
        departureCity: '', arrivalCity: '', totalAmount: 0,
        status: 'COMPLETED',
        passengers: [{ id: 'p1', name: 'Ana' }]
      };
      component.openPassengersModal(trip);
      expect(component.showPassengersModal).toBe(true);
      expect(component.selectedTripPassengers.length).toBe(1);
      expect(component.selectedTripPassengers[0].name).toBe('Ana');
    });

    it('should set empty array when trip has no passengers', () => {
      const trip: TripDetailsDTO = {
        id: 2, date: '', time: '', driverName: '',
        departureCity: '', arrivalCity: '', totalAmount: 0,
        status: 'SCHEDULED', passengers: []
      };
      component.openPassengersModal(trip);
      expect(component.selectedTripPassengers).toEqual([]);
    });
  });

  // ─── closeModals ─────────────────────────────────────────────────────────

  describe('closeModals', () => {
    it('should reset all modal flags and selections', () => {
      component.showAddModal = true;
      component.showEditModal = true;
      component.showDeleteModal = true;
      component.showPassengersModal = true;
      component.selectedTrip = { id: 1 } as any;
      component.selectedTripPassengers = [{ id: 'p1', name: 'X' }];
      component.closeModals();
      expect(component.showAddModal).toBe(false);
      expect(component.showEditModal).toBe(false);
      expect(component.showDeleteModal).toBe(false);
      expect(component.showPassengersModal).toBe(false);
      expect(component.selectedTrip).toBeNull();
      expect(component.selectedTripPassengers).toEqual([]);
    });
  });

  // ─── saveRate ─────────────────────────────────────────────────────────────

  describe('saveRate', () => {
    beforeEach(() => {
      component.pricing = { ...mockPricing };
    });

    it('should call atualizarTarifa with full pricing object', () => {
      component.saveRate();
      expect(settingsServiceMock.atualizarTarifa).toHaveBeenCalledWith(mockPricing);
    });

    it('should update pricing with saved result', () => {
      const saved: PricingConfig = { minimumFare: 20, perKmRate: 3, cancellationFee: 5, commissionRate: 20 };
      settingsServiceMock.atualizarTarifa.mockReturnValue(of(saved));
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.saveRate();
      expect(component.pricing).toEqual(saved);
    });

    it('should alert when perKmRate is 0', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.pricing.perKmRate = 0;
      component.saveRate();
      expect(alertSpy).toHaveBeenCalled();
      expect(settingsServiceMock.atualizarTarifa).not.toHaveBeenCalled();
    });

    it('should alert when minimumFare is 0', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.pricing.minimumFare = 0;
      component.saveRate();
      expect(alertSpy).toHaveBeenCalled();
      expect(settingsServiceMock.atualizarTarifa).not.toHaveBeenCalled();
    });
  });
});