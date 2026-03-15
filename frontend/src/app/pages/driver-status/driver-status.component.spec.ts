import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PLATFORM_ID, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DriverStatus } from './driver-status';
import { AuthService, UserProfile } from '../../services/auth.service';

function makeAuthMock(user: Partial<UserProfile> | null = null) {
  return {
    currentUser: signal(user as UserProfile | null),
    logout: vi.fn()
  };
}

describe('DriverStatus', () => {
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  function setup(user: Partial<UserProfile> | null, platformId = 'browser') {
    routerMock = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      imports: [CommonModule, DriverStatus],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: makeAuthMock(user) },
        { provide: PLATFORM_ID, useValue: platformId }
      ]
    });
    return TestBed.createComponent(DriverStatus).componentInstance;
  }

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    const component = setup({ role: 'DRIVER', registrationStatus: 'PENDING' });
    expect(component).toBeTruthy();
  });

  // ─── computed status ─────────────────────────────────────────────────────

  describe('status', () => {
    it('should return PENDING when user has no registrationStatus', () => {
      const component = setup({ role: 'DRIVER' });
      expect(component.status()).toBe('PENDING');
    });

    it('should return REJECTED when user has registrationStatus REJECTED', () => {
      const component = setup({ role: 'DRIVER', registrationStatus: 'REJECTED', rejectionReason: 'Motivo X' });
      expect(component.status()).toBe('REJECTED');
    });

    it('should return PENDING when user is null', () => {
      const component = setup(null);
      expect(component.status()).toBe('PENDING');
    });
  });

  describe('rejectionReason', () => {
    it('should return rejectionReason from user', () => {
      const component = setup({ role: 'DRIVER', registrationStatus: 'REJECTED', rejectionReason: 'CNH inválida' });
      expect(component.rejectionReason()).toBe('CNH inválida');
    });

    it('should return empty string when no reason', () => {
      const component = setup({ role: 'DRIVER', registrationStatus: 'PENDING' });
      expect(component.rejectionReason()).toBe('');
    });
  });

  describe('isPending / isRejected', () => {
    it('isPending should be true when status is PENDING', () => {
      const component = setup({ role: 'DRIVER', registrationStatus: 'PENDING' });
      expect(component.isPending()).toBe(true);
      expect(component.isRejected()).toBe(false);
    });

    it('isRejected should be true when status is REJECTED', () => {
      const component = setup({ role: 'DRIVER', registrationStatus: 'REJECTED' });
      expect(component.isRejected()).toBe(true);
      expect(component.isPending()).toBe(false);
    });
  });

  // ─── ngOnInit redirects ───────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should redirect APPROVED driver to /home', () => {
      const component = setup({ role: 'DRIVER', registrationStatus: 'APPROVED' });
      component.ngOnInit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should redirect non-driver user to /home', () => {
      const component = setup({ role: 'client', registrationStatus: 'PENDING' });
      component.ngOnInit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should NOT redirect PENDING driver', () => {
      const component = setup({ role: 'DRIVER', registrationStatus: 'PENDING' });
      component.ngOnInit();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should NOT redirect REJECTED driver', () => {
      const component = setup({ role: 'DRIVER', registrationStatus: 'REJECTED' });
      component.ngOnInit();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should skip redirect on server (SSR)', () => {
      const component = setup({ role: 'DRIVER', registrationStatus: 'APPROVED' }, 'server');
      component.ngOnInit();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should call authService.logout', () => {
      const authMock = makeAuthMock({ role: 'DRIVER', registrationStatus: 'PENDING' });
      TestBed.configureTestingModule({
        imports: [CommonModule, DriverStatus],
        providers: [
          { provide: Router, useValue: { navigate: vi.fn() } },
          { provide: AuthService, useValue: authMock },
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      const component = TestBed.createComponent(DriverStatus).componentInstance;
      component.logout();
      expect(authMock.logout).toHaveBeenCalled();
    });
  });
});
