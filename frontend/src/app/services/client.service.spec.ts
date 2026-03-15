import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClienteService, Cliente } from './client.service';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  const BASE = 'http://localhost:8080/api/admin/clients';

  const mockCliente: Cliente = {
    id: 'uuid-cliente-1',
    name: 'Ana Beatriz',
    cpf: '123.456.789-00',
    phone: '81999999999',
    email: 'ana@email.com',
    role: 'client',
    active: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClienteService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listar', () => {
    it('should GET clients with default pagination and return content array', () => {
      const mockPage = { content: [mockCliente], totalElements: 1, totalPages: 1, number: 0, size: 100 };

      service.listar().subscribe(res => {
        expect(res.length).toBe(1);
        expect(res[0].name).toBe('Ana Beatriz');
      });

      const req = httpMock.expectOne(r =>
        r.url === BASE &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '100'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('should accept custom page and size', () => {
      const mockPage = { content: [], totalElements: 0, totalPages: 0, number: 2, size: 10 };

      service.listar(2, 10).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === BASE &&
        r.params.get('page') === '2' &&
        r.params.get('size') === '10'
      );
      req.flush(mockPage);
    });
  });

  describe('adicionar', () => {
    it('should POST to /clients with client data', () => {
      const novo: Partial<Cliente> = { name: 'Novo Cliente', email: 'novo@email.com' };

      service.adicionar(novo).subscribe(res => {
        expect(res.id).toBe(mockCliente.id);
      });

      const req = httpMock.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(novo);
      req.flush(mockCliente);
    });
  });

  describe('editar', () => {
    it('should PUT to /clients/:id with updated data', () => {
      const update = { ...mockCliente, name: 'Ana Editada' };

      service.editar(update).subscribe(res => {
        expect(res.name).toBe('Ana Editada');
      });

      const req = httpMock.expectOne(`${BASE}/${mockCliente.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      req.flush({ ...mockCliente, name: 'Ana Editada' });
    });
  });

  describe('excluir', () => {
    it('should DELETE /clients/:id', () => {
      service.excluir(mockCliente.id).subscribe();

      const req = httpMock.expectOne(`${BASE}/${mockCliente.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
