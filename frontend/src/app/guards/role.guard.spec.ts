import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { PLATFORM_ID, signal } from '@angular/core';
import { of } from 'rxjs';

const mockRouter = { createUrlTree: vi.fn((path: string[]) => path) };
const mockState = {} as RouterStateSnapshot;

function makeRoute(roles: string[]): ActivatedRouteSnapshot {
  return { data: { roles } } as unknown as ActivatedRouteSnapshot;
}

function runGuard(role: string | null, allowedRoles: string[], hasCachedUser = true) {
  const userSignal = signal(hasCachedUser && role ? { role, id: '1', name: 'Test', email: 'test@test.com' } : null);
  const authServiceMock = {
    currentUser: userSignal,
    getMe: vi.fn().mockReturnValue(of({ role, id: '1', name: 'Test', email: 'test@test.com' }))
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: Router, useValue: mockRouter },
      { provide: AuthService, useValue: authServiceMock },
      { provide: PLATFORM_ID, useValue: 'browser' }
    ]
  });
  return TestBed.runInInjectionContext(() => roleGuard(makeRoute(allowedRoles), mockState));
}

describe('roleGuard', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should allow admin to access admin-only route', () => {
    const result = runGuard('admin', ['admin']);
    expect(result).toBe(true);
  });

  it('should block driver from accessing admin-only route', () => {
    runGuard('driver', ['admin']);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should block client from accessing admin route', () => {
    runGuard('client', ['admin']);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should block when no roles are configured', () => {
    runGuard('admin', []);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should allow when user role matches one of multiple allowed roles', () => {
    const result = runGuard('driver', ['admin', 'driver']);
    expect(result).toBe(true);
  });

  it('should allow on server (SSR)', () => {
    const authServiceMock = { currentUser: signal(null), getMe: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: authServiceMock },
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    });
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(makeRoute(['admin']), mockState)
    );
    expect(result).toBe(true);
  });
});
