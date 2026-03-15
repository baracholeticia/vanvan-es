import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SettingsService, PricingConfig, DriverOption, SpringPage, Journey } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;

  const BASE = 'http://localhost:8080/api/admin';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─── Pricing ────────────────────────────────────────────────────────────

  describe('obterTarifaAtual', () => {
    it('should GET /api/admin/settings/pricing', () => {
      const mock: PricingConfig = {
        minimumFare: 10,
        perKmRate: 1.5,
        cancellationFee: 2.5,
        commissionRate: 15
      };

      service.obterTarifaAtual().subscribe(res => {
        expect(res).toEqual(mock);
      });

      const req = httpMock.expectOne(`${BASE}/settings/pricing`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });
  });

  describe('atualizarTarifa', () => {
    it('should PUT /api/admin/settings/pricing with full body', () => {
      const payload: PricingConfig = {
        minimumFare: 12,
        perKmRate: 2.0,
        cancellationFee: 3.0,
        commissionRate: 20
      };

      service.atualizarTarifa(payload).subscribe(res => {
        expect(res).toEqual(payload);
      });

      const req = httpMock.expectOne(`${BASE}/settings/pricing`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(payload);
    });

    it('should send all four pricing fields (not partial)', () => {
      const payload: PricingConfig = {
        minimumFare: 5,
        perKmRate: 1,
        cancellationFee: 1,
        commissionRate: 10
      };

      service.atualizarTarifa(payload).subscribe();

      const req = httpMock.expectOne(`${BASE}/settings/pricing`);
      const body = req.request.body as PricingConfig;
      expect(body).toHaveProperty('minimumFare');
      expect(body).toHaveProperty('perKmRate');
      expect(body).toHaveProperty('cancellationFee');
      expect(body).toHaveProperty('commissionRate');
      req.flush(payload);
    });
  });

  // ─── Motoristas ──────────────────────────────────────────────────────────

  describe('listarMotoristas', () => {
    it('should GET /api/admin/drivers with default pagination', () => {
      const mock: SpringPage<DriverOption> = {
        content: [
          { id: 'uuid-1', name: 'João Silva' },
          { id: 'uuid-2', name: 'Maria Souza' }
        ],
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 100
      };

      service.listarMotoristas().subscribe(res => {
        expect(res.content.length).toBe(2);
        expect(res.content[0].name).toBe('João Silva');
      });

      const req = httpMock.expectOne(r =>
        r.url === `${BASE}/drivers` &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '100'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });

    it('should pass custom page and size params', () => {
      const mock: SpringPage<DriverOption> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 1,
        size: 10
      };

      service.listarMotoristas(1, 10).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${BASE}/drivers` &&
        r.params.get('page') === '1' &&
        r.params.get('size') === '10'
      );
      req.flush(mock);
    });

    it('should return empty content when no drivers exist', () => {
      const mock: SpringPage<DriverOption> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 100
      };

      service.listarMotoristas().subscribe(res => {
        expect(res.content).toEqual([]);
      });

      const req = httpMock.expectOne(r => r.url === `${BASE}/drivers`);
      req.flush(mock);
    });
  });

  // ─── Trechos ─────────────────────────────────────────────────────────────

  describe('listarTrechos', () => {
    it('should GET /api/admin/routes', () => {
      const mock: Journey[] = [
        { id: 1, name: 'Rota 1', origin: 'Garanhuns', destination: 'Recife' }
      ];

      service.listarTrechos().subscribe(res => {
        expect(res.length).toBe(1);
        expect(res[0].origin).toBe('Garanhuns');
      });

      const req = httpMock.expectOne(`${BASE}/routes`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });
  });

  describe('excluirTrecho', () => {
    it('should DELETE /api/admin/routes/:id', () => {
      service.excluirTrecho(1).subscribe();

      const req = httpMock.expectOne(`${BASE}/routes/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
