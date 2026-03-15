import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { signal } from '@angular/core';
import { AjustarValores } from './ajustar-valores';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast/toast.service';

function makeAuthMock(userId = 'user-1') {
  return { currentUser: signal({ id: userId, name: 'Test', email: 'test@test.com', role: 'driver' }) };
}

function makeToastMock() {
  return { success: vi.fn(), error: vi.fn() };
}

describe('AjustarValores', () => {
  let component: AjustarValores;
  let toastMock: ReturnType<typeof makeToastMock>;

  beforeEach(() => {
    toastMock = makeToastMock();
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, AjustarValores],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: AuthService, useValue: makeAuthMock() },
        { provide: ToastService, useValue: toastMock }
      ]
    });
    component = TestBed.createComponent(AjustarValores).componentInstance;
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ─── Computed getters ────────────────────────────────────────────────────

  describe('minAllowedRate', () => {
    it('should be 80% of defaultRatePerKm when minVariation is -20', () => {
      component.pricingConfig.defaultRatePerKm = 1.00;
      component.pricingConfig.minVariation = -20;
      expect(component.minAllowedRate).toBeCloseTo(0.80);
    });
  });

  describe('maxAllowedRate', () => {
    it('should be 130% of defaultRatePerKm when maxVariation is +30', () => {
      component.pricingConfig.defaultRatePerKm = 1.00;
      component.pricingConfig.maxVariation = 30;
      expect(component.maxAllowedRate).toBeCloseTo(1.30);
    });
  });

  describe('currentVariationPercent', () => {
    it('should return 0 when editingRate equals defaultRatePerKm', () => {
      component.pricingConfig.defaultRatePerKm = 0.70;
      component.editingRate = 0.70;
      expect(component.currentVariationPercent).toBeCloseTo(0);
    });

    it('should return positive percent when editingRate is above default', () => {
      component.pricingConfig.defaultRatePerKm = 1.00;
      component.editingRate = 1.20;
      expect(component.currentVariationPercent).toBeCloseTo(20);
    });

    it('should return negative percent when editingRate is below default', () => {
      component.pricingConfig.defaultRatePerKm = 1.00;
      component.editingRate = 0.80;
      expect(component.currentVariationPercent).toBeCloseTo(-20);
    });

    it('should return 0 when defaultRatePerKm is 0', () => {
      component.pricingConfig.defaultRatePerKm = 0;
      expect(component.currentVariationPercent).toBe(0);
    });
  });

  describe('isRateValid', () => {
    it('should be true when editingRate is within bounds', () => {
      component.pricingConfig = { defaultRatePerKm: 1.0, driverRatePerKm: 1.0, minVariation: -20, maxVariation: 30 };
      component.editingRate = 1.0;
      expect(component.isRateValid).toBe(true);
    });

    it('should be false when editingRate is below min', () => {
      component.pricingConfig = { defaultRatePerKm: 1.0, driverRatePerKm: 1.0, minVariation: -20, maxVariation: 30 };
      component.editingRate = 0.50;
      expect(component.isRateValid).toBe(false);
    });

    it('should be false when editingRate is above max', () => {
      component.pricingConfig = { defaultRatePerKm: 1.0, driverRatePerKm: 1.0, minVariation: -20, maxVariation: 30 };
      component.editingRate = 2.00;
      expect(component.isRateValid).toBe(false);
    });
  });

  describe('hasChanges', () => {
    it('should be false when editingRate equals driverRatePerKm', () => {
      component.pricingConfig.driverRatePerKm = 0.70;
      component.editingRate = 0.70;
      expect(component.hasChanges).toBe(false);
    });

    it('should be true when editingRate differs', () => {
      component.pricingConfig.driverRatePerKm = 0.70;
      component.editingRate = 0.80;
      expect(component.hasChanges).toBe(true);
    });
  });

  // ─── adjustRate ──────────────────────────────────────────────────────────

  describe('adjustRate', () => {
    beforeEach(() => {
      component.pricingConfig = { defaultRatePerKm: 1.0, driverRatePerKm: 1.0, minVariation: -20, maxVariation: 30 };
      component.editingRate = 1.0;
    });

    it('should increase rate by delta', () => {
      component.adjustRate(0.10);
      expect(component.editingRate).toBeCloseTo(1.10);
    });

    it('should decrease rate by delta', () => {
      component.adjustRate(-0.10);
      expect(component.editingRate).toBeCloseTo(0.90);
    });

    it('should NOT exceed maxAllowedRate', () => {
      component.editingRate = 1.29;
      component.adjustRate(0.10); // would exceed 1.30
      expect(component.editingRate).toBeCloseTo(1.29);
    });

    it('should NOT go below minAllowedRate', () => {
      component.editingRate = 0.81;
      component.adjustRate(-0.10); // would go below 0.80
      expect(component.editingRate).toBeCloseTo(0.81);
    });
  });

  // ─── setToDefault / setToMin / setToMax ──────────────────────────────────

  describe('preset setters', () => {
    beforeEach(() => {
      component.pricingConfig = { defaultRatePerKm: 1.0, driverRatePerKm: 1.0, minVariation: -20, maxVariation: 30 };
    });

    it('setToDefault sets editingRate to defaultRatePerKm', () => {
      component.editingRate = 0.90;
      component.setToDefault();
      expect(component.editingRate).toBe(1.0);
    });

    it('setToMin sets editingRate to minAllowedRate', () => {
      component.setToMin();
      expect(component.editingRate).toBeCloseTo(0.80);
    });

    it('setToMax sets editingRate to maxAllowedRate', () => {
      component.setToMax();
      expect(component.editingRate).toBeCloseTo(1.30);
    });
  });

  // ─── updateRoutePreview ───────────────────────────────────────────────────

  describe('updateRoutePreview', () => {
    it('should recalculate estimatedPrice for all routes', () => {
      component.editingRate = 2.0;
      component.updateRoutePreview();
      component.routePreviews.forEach(route => {
        expect(route.estimatedPrice).toBeCloseTo(route.distance * 2.0);
      });
    });
  });

  // ─── saveRate ─────────────────────────────────────────────────────────────

  describe('saveRate', () => {
    it('should call toastService.error when rate is invalid', () => {
      component.pricingConfig = { defaultRatePerKm: 1.0, driverRatePerKm: 1.0, minVariation: -20, maxVariation: 30 };
      component.editingRate = 0.10; // below min
      component.saveRate();
      expect(toastMock.error).toHaveBeenCalled();
    });
  });

  // ─── cancelChanges ────────────────────────────────────────────────────────

  describe('cancelChanges', () => {
    it('should reset editingRate to driverRatePerKm', () => {
      component.pricingConfig.driverRatePerKm = 0.70;
      component.editingRate = 1.20;
      component.cancelChanges();
      expect(component.editingRate).toBe(0.70);
    });
  });

  // ─── formatCurrency / formatVariation ────────────────────────────────────

  describe('formatCurrency', () => {
    it('should format number as R$ with comma', () => {
      expect(component.formatCurrency(1.5)).toBe('R$1,50');
      expect(component.formatCurrency(10)).toBe('R$10,00');
    });
  });

  describe('formatVariation', () => {
    it('should show + sign for positive values', () => {
      expect(component.formatVariation(20)).toBe('+20%');
    });

    it('should show - sign for negative values', () => {
      expect(component.formatVariation(-15)).toBe('-15%');
    });
  });
});
