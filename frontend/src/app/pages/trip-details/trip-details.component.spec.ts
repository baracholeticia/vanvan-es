import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TripDetails } from './trip-details';

function makeRoute(id = 'trip-1') {
  return { snapshot: { paramMap: { get: vi.fn().mockReturnValue(id) } } };
}

describe('TripDetails', () => {
  let component: TripDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TripDetails],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute('trip-42') },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    });
    component = TestBed.createComponent(TripDetails).componentInstance;
    component.ngOnInit();
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should read tripId from route params', () => {
    expect(component.tripId).toBe('trip-42');
  });

  // ─── computed getters (com trip mockado) ─────────────────────────────────

  describe('computed with trip set', () => {
    beforeEach(() => {
      component.trip = {
        id: '1',
        origin: 'Garanhuns', originLocation: '', originReference: '',
        destination: 'Recife', destinationLocation: '', destinationReference: '',
        date: '10/03/2026', time: '08:00', price: 'R$45,00',
        distance: '230 km', duration: '3h',
        availableSeats: 4, totalSeats: 15,
        status: 'scheduled',
        driverName: 'Carlos', driverPhone: '87999', driverRating: 4.8,
        vehicleModel: 'Sprinter', vehiclePlate: 'ABC1D23', vehicleImage: '',
        originCoords: { lat: 0, lng: 0 },
        destinationCoords: { lat: 0, lng: 0 },
        passengers: [
          { id: '1', name: 'Ana', phone: '', boardingPoint: '', status: 'confirmed' },
          { id: '2', name: 'João', phone: '', boardingPoint: '', status: 'confirmed' },
          { id: '3', name: 'Maria', phone: '', boardingPoint: '', status: 'pending' },
          { id: '4', name: 'Pedro', phone: '', boardingPoint: '', status: 'cancelled' },
        ],
        hasAirConditioning: true, acceptsPets: false, hasLargeLuggage: true
      };
    });

    it('confirmedCount should count confirmed passengers', () => {
      expect(component.confirmedCount).toBe(2);
    });

    it('pendingCount should count pending passengers', () => {
      expect(component.pendingCount).toBe(1);
    });

    it('cancelledCount should count cancelled passengers', () => {
      expect(component.cancelledCount).toBe(1);
    });

    it('occupancyPercent should calculate correctly', () => {
      // 15 - 4 = 11 occupied / 15 total = 73%
      expect(component.occupancyPercent).toBe(73);
    });

    it('formattedDate should parse dd/mm/yyyy into day/month/year', () => {
      const d = component.formattedDate;
      expect(d.day).toBe('10');
      expect(d.month).toBe('MAR');
      expect(d.year).toBe('2026');
    });

    it('statusLabel should return "Agendada" for scheduled', () => {
      expect(component.statusLabel).toBe('Agendada');
    });

    it('statusVariant should return "warning" for scheduled', () => {
      expect(component.statusVariant).toBe('warning');
    });
  });

  describe('statusLabel for each status', () => {
    const cases = [
      { status: 'in-progress', label: 'Em andamento' },
      { status: 'completed', label: 'Finalizada' },
      { status: 'cancelled', label: 'Cancelada' },
    ] as const;

    cases.forEach(({ status, label }) => {
      it(`should return "${label}" for ${status}`, () => {
        component.trip = { status } as any;
        expect(component.statusLabel).toBe(label);
      });
    });
  });

  describe('formattedDate with null trip', () => {
    it('should return empty strings when trip is null', () => {
      component.trip = null;
      const d = component.formattedDate;
      expect(d.day).toBe('');
      expect(d.month).toBe('');
      expect(d.year).toBe('');
    });
  });

  describe('passengerStatusLabel', () => {
    it('should return Portuguese labels', () => {
      expect(component.passengerStatusLabel('confirmed')).toBe('Confirmado');
      expect(component.passengerStatusLabel('pending')).toBe('Pendente');
      expect(component.passengerStatusLabel('cancelled')).toBe('Cancelado');
    });
  });

  describe('goBack', () => {
    it('should navigate to /viagens', () => {
      const router = TestBed.inject(Router);
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/viagens']);
    });
  });
});
