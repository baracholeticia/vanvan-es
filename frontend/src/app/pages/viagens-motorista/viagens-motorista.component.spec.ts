import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { signal } from '@angular/core';
import { ViagensMotorista } from './viagens-motorista';
import { AuthService } from '../../services/auth.service';

function makeAuthMock(userId = 'driver-1') {
  return {
    currentUser: signal({ id: userId, name: 'Test Driver', email: 'driver@test.com', role: 'driver' })
  };
}

describe('ViagensMotorista', () => {
  let component: ViagensMotorista;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [CommonModule, ViagensMotorista],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: makeAuthMock() }
      ]
    });
    component = TestBed.createComponent(ViagensMotorista).componentInstance;
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ─── filteredTrips ────────────────────────────────────────────────────────

  describe('filteredTrips', () => {
    it('should return all trips when filter is "all"', () => {
      component.selectedFilter = 'all';
      expect(component.filteredTrips.length).toBe(component.pastTrips.length);
    });

    it('should return only completed trips', () => {
      component.selectedFilter = 'completed';
      expect(component.filteredTrips.every(t => t.status === 'completed')).toBe(true);
    });

    it('should return only cancelled trips', () => {
      component.selectedFilter = 'cancelled';
      expect(component.filteredTrips.every(t => t.status === 'cancelled')).toBe(true);
    });
  });

  // ─── counts ──────────────────────────────────────────────────────────────

  describe('completedTripsCount', () => {
    it('should count only completed trips', () => {
      const expected = component.pastTrips.filter(t => t.status === 'completed').length;
      expect(component.completedTripsCount).toBe(expected);
    });
  });

  describe('cancelledTripsCount', () => {
    it('should count only cancelled trips', () => {
      const expected = component.pastTrips.filter(t => t.status === 'cancelled').length;
      expect(component.cancelledTripsCount).toBe(expected);
    });
  });

  // ─── totalEarnings ────────────────────────────────────────────────────────

  describe('totalEarnings', () => {
    it('should sum price * passengers for completed trips only', () => {
      const expected = component.pastTrips
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.price.replace('R$', '').replace(',', '.')) * (t.passengers ?? 0), 0);
      expect(component.totalEarnings).toContain('R$');
      const numericPart = parseFloat(component.totalEarnings.replace('R$', '').replace(',', '.'));
      expect(numericPart).toBeCloseTo(expected, 0);
    });

    it('should not include cancelled trips in earnings', () => {
      const allTrips = component.pastTrips.reduce(
        (sum, t) => sum + parseFloat(t.price.replace('R$', '').replace(',', '.')) * (t.passengers ?? 0), 0
      );
      const completedOnly = parseFloat(component.totalEarnings.replace('R$', '').replace(',', '.'));
      expect(completedOnly).toBeLessThanOrEqual(allTrips);
    });
  });

  // ─── setFilter ────────────────────────────────────────────────────────────

  describe('setFilter', () => {
    it('should update selectedFilter', () => {
      component.setFilter('completed');
      expect(component.selectedFilter).toBe('completed');
    });

    it('should switch back to all', () => {
      component.setFilter('cancelled');
      component.setFilter('all');
      expect(component.selectedFilter).toBe('all');
    });
  });

  // ─── repeatTrip ───────────────────────────────────────────────────────────

  describe('repeatTrip', () => {
    it('should navigate to /ofertar-viagem with trip data as queryParams', () => {
      const trip = component.pastTrips[0];
      component.repeatTrip(trip);
      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/ofertar-viagem'],
        expect.objectContaining({
          queryParams: expect.objectContaining({
            departureCity: trip.origin,
            destinationCity: trip.destination
          })
        })
      );
    });
  });

  // ─── goBack ──────────────────────────────────────────────────────────────

  describe('goBack', () => {
    it('should navigate to /motorista', () => {
      component.goBack();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/motorista']);
    });
  });

  // ─── formatDate ───────────────────────────────────────────────────────────

  describe('formatDate', () => {
    it('should return day and month abbreviation', () => {
      const result = component.formatDate('10/02/2026');
      expect(result.day).toBe('10');
      expect(result.month).toBe('FEV');
    });

    it('should return correct month for december', () => {
      const result = component.formatDate('25/12/2026');
      expect(result.month).toBe('DEZ');
    });
  });
});
