import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MotoristaService, Motorista } from './motoristas.service';

describe('MotoristaService', () => {
  let service: MotoristaService;
  let httpMock: HttpTestingController;

  const BASE = 'http://localhost:8080/api/admin/drivers';

  const mockMotorista: Motorista = {
    id: 'uuid-driver-1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '81988887777',
    cnh: '12345678900',
    birthDate: '1990-05-15',
    registrationStatus: 'APPROVED'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MotoristaService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MotoristaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listar', () => {
    it('should GET drivers and return content array', () => {
      const mockPage = {
        content: [mockMotorista],
        totalElements: 1, totalPages: 1, number: 0, size: 100
      };

      service.listar().subscribe(res => {
        expect(res.length).toBe(1);
        expect(res[0].registrationStatus).toBe('APPROVED');
      });

      const req = httpMock.expectOne(r =>
        r.url === BASE &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '100'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('should support PENDING and REJECTED drivers in content', () => {
      const pending: Motorista = { ...mockMotorista, id: 'uuid-2', registrationStatus: 'PENDING' };
      const rejected: Motorista = { ...mockMotorista, id: 'uuid-3', registrationStatus: 'REJECTED', rejectionReason: 'CNH inválida' };
      const mockPage = { content: [pending, rejected], totalElements: 2, totalPages: 1, number: 0, size: 100 };

      service.listar().subscribe(res => {
        expect(res[0].registrationStatus).toBe('PENDING');
        expect(res[1].registrationStatus).toBe('REJECTED');
        expect(res[1].rejectionReason).toBe('CNH inválida');
      });

      const req = httpMock.expectOne(r => r.url === BASE);
      req.flush(mockPage);
    });
  });

  describe('editar', () => {
    it('should PUT to /drivers/:id', () => {
      const update = { ...mockMotorista, name: 'João Editado' };

      service.editar(update).subscribe(res => {
        expect(res.name).toBe('João Editado');
      });

      const req = httpMock.expectOne(`${BASE}/${mockMotorista.id}`);
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockMotorista, name: 'João Editado' });
    });
  });

  describe('excluir', () => {
    it('should DELETE /drivers/:id', () => {
      service.excluir(mockMotorista.id).subscribe();

      const req = httpMock.expectOne(`${BASE}/${mockMotorista.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
