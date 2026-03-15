import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;

  const BASE = 'http://localhost:8080/api/vehicles';

  const mockVehicle = {
    id: 'v-uuid-1',
    modelName: 'Fiat Uno',
    licensePlate: 'ABC-1234',
    driverId: 'driver-uuid-1'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VehicleService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getVehiclesByDriver', () => {
    it('should GET /vehicles/driver/:driverId', () => {
      service.getVehiclesByDriver('driver-uuid-1').subscribe(res => {
        expect(res.length).toBe(1);
        expect(res[0].modelName).toBe('Fiat Uno');
      });

      const req = httpMock.expectOne(`${BASE}/driver/driver-uuid-1`);
      expect(req.request.method).toBe('GET');
      req.flush([mockVehicle]);
    });
  });

  describe('getVehicleById', () => {
    it('should GET /vehicles/:id', () => {
      service.getVehicleById('v-uuid-1').subscribe(res => {
        expect(res.licensePlate).toBe('ABC-1234');
      });

      const req = httpMock.expectOne(`${BASE}/v-uuid-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVehicle);
    });
  });

  describe('deleteVehicle', () => {
    it('should DELETE /vehicles/:id', () => {
      service.deleteVehicle('v-uuid-1').subscribe();

      const req = httpMock.expectOne(`${BASE}/v-uuid-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('createVehicle', () => {
    it('should POST with FormData containing required fields', () => {
      const doc = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });

      service.createVehicle('driver-uuid-1', 'Fiat Uno', 'ABC-1234', doc).subscribe(res => {
        expect(res.modelName).toBe('Fiat Uno');
      });

      const req = httpMock.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      const body = req.request.body as FormData;
      expect(body.get('driverId')).toBe('driver-uuid-1');
      expect(body.get('modelName')).toBe('Fiat Uno');
      expect(body.get('licensePlate')).toBe('ABC-1234');
      req.flush(mockVehicle);
    });
  });

  describe('URL helpers', () => {
    it('getVehiclePhotoUrl should return correct URL', () => {
      expect(service.getVehiclePhotoUrl('v-uuid-1')).toBe(`${BASE}/v-uuid-1/photo`);
    });

    it('getVehicleDocumentUrl should return correct URL', () => {
      expect(service.getVehicleDocumentUrl('v-uuid-1')).toBe(`${BASE}/v-uuid-1/document`);
    });
  });
});
