import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MotoristaPage } from './motorista-page';
import { ToastService } from '../../components/toast/toast.service';

function makeToastMock() {
  return { success: vi.fn(), error: vi.fn() };
}

describe('MotoristaPage', () => {
  let component: MotoristaPage;
  let toastMock: ReturnType<typeof makeToastMock>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    toastMock = makeToastMock();
    routerMock = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [CommonModule, MotoristaPage],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ToastService, useValue: toastMock }
      ]
    });
    component = TestBed.createComponent(MotoristaPage).componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ─── adjustSeats ─────────────────────────────────────────────────────────

  describe('adjustSeats', () => {
    it('should increase availableSeats by delta', () => {
      component.currentTrip.availableSeats = 10;
      component.adjustSeats(1);
      expect(component.currentTrip.availableSeats).toBe(11);
    });

    it('should decrease availableSeats by delta', () => {
      component.currentTrip.availableSeats = 10;
      component.adjustSeats(-1);
      expect(component.currentTrip.availableSeats).toBe(9);
    });

    it('should NOT go below 0', () => {
      component.currentTrip.availableSeats = 0;
      component.adjustSeats(-1);
      expect(component.currentTrip.availableSeats).toBe(0);
    });
  });

  // ─── startTrip / finishTrip ───────────────────────────────────────────────

  describe('startTrip', () => {
    it('should set tripStatus to in_progress', () => {
      component.startTrip();
      expect(component.tripStatus).toBe('in_progress');
    });

    it('should reset elapsedTime to 0', () => {
      component.elapsedTime = 100;
      component.startTrip();
      expect(component.elapsedTime).toBe(0);
    });

    it('should show success toast', () => {
      component.startTrip();
      expect(toastMock.success).toHaveBeenCalled();
    });
  });

  describe('finishTrip', () => {
    beforeEach(() => component.startTrip());

    it('should set tripStatus to completed', () => {
      component.finishTrip();
      expect(component.tripStatus).toBe('completed');
    });

    it('should set tripProgress to 100', () => {
      component.finishTrip();
      expect(component.tripProgress).toBe(100);
    });

    it('should show success toast', () => {
      component.finishTrip();
      expect(toastMock.success).toHaveBeenCalled();
    });
  });

  // ─── totalEarnings ────────────────────────────────────────────────────────

  describe('totalEarnings', () => {
    it('should calculate passengers * pricePerSeat', () => {
      component.currentTrip.confirmedPassengers = 10;
      component.currentTrip.pricePerSeat = 40;
      expect(component.totalEarnings).toBe('R$400,00');
    });

    it('should return R$0,00 when no currentTrip', () => {
      component.currentTrip = null;
      expect(component.totalEarnings).toBe('R$0,00');
    });
  });

  // ─── formattedElapsedTime ─────────────────────────────────────────────────

  describe('formattedElapsedTime', () => {
    it('should format seconds as MM:SS when under 1 hour', () => {
      component.elapsedTime = 90; // 1m 30s
      expect(component.formattedElapsedTime).toBe('01:30');
    });

    it('should format as Xh YYm when >= 1 hour', () => {
      component.elapsedTime = 3720; // 1h 2m
      expect(component.formattedElapsedTime).toBe('1h 02m');
    });
  });

  // ─── toggles ─────────────────────────────────────────────────────────────

  describe('togglePassengersPopup', () => {
    it('should toggle showPassengersPopup', () => {
      expect(component.showPassengersPopup).toBe(false);
      component.togglePassengersPopup();
      expect(component.showPassengersPopup).toBe(true);
      component.togglePassengersPopup();
      expect(component.showPassengersPopup).toBe(false);
    });

    it('should close emergencyPopup when opening passengers', () => {
      component.showEmergencyPopup = true;
      component.togglePassengersPopup();
      expect(component.showEmergencyPopup).toBe(false);
    });
  });

  // ─── navigation ──────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('ofertarViagem should navigate to /ofertar-viagem', () => {
      component.ofertarViagem();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/ofertar-viagem']);
    });

    it('verMaisViagens should navigate to /viagens-motorista', () => {
      component.verMaisViagens();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/viagens-motorista']);
    });

    it('alterarValores should navigate to /ajustar-valores', () => {
      component.alterarValores();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/ajustar-valores']);
    });

    it('editarVeiculo should navigate to /seu-veiculo', () => {
      component.editarVeiculo();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/seu-veiculo']);
    });

    it('verFaturamento should navigate to /faturamento', () => {
      component.verFaturamento();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/faturamento']);
    });
  });

  // ─── ngOnDestroy ─────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should clear timer interval if running', () => {
      component.startTrip(); // inicia o interval
      // usa globalThis em vez de global (compatível com Vitest/jsdom)
      const clearSpy = vi.spyOn(globalThis, 'clearInterval');
      component.ngOnDestroy();
      expect(clearSpy).toHaveBeenCalled();
    });
  });
});