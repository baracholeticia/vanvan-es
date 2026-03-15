import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

function setup(token: string | null) {
  const authServiceMock = { getToken: vi.fn().mockReturnValue(token) };
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting()
    ]
  });
  return {
    http: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController)
  };
}

describe('authInterceptor', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('should attach Authorization header when token exists', () => {
    const { http, httpMock } = setup('my-jwt-token');

    http.get('http://localhost:8080/api/admin/drivers').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/admin/drivers');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush([]);
  });

  it('should NOT attach Authorization header when token is null', () => {
    const { http, httpMock } = setup(null);

    http.get('http://localhost:8080/api/admin/drivers').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/admin/drivers');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should NOT attach Authorization header to /auth/login', () => {
    const { http, httpMock } = setup('my-jwt-token');

    http.post('http://localhost:8080/api/auth/login', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ token: 'new-token' });
  });

  it('should NOT attach Authorization header to /auth/register', () => {
    const { http, httpMock } = setup('my-jwt-token');

    http.post('http://localhost:8080/api/auth/register', {}).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ success: true });
  });
});
