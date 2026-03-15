import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { ClientsComponent } from './clients';
import { ClienteService, Cliente } from '../../services/client.service';

const mockCliente = (overrides: Partial<Cliente> = {}): Cliente => ({
  id: 'uuid-1',
  name: 'Ana Beatriz',
  cpf: '123.456.789-00',
  phone: '81999999999',
  email: 'ana@email.com',
  role: 'client',
  active: true,
  ...overrides
});

function makeClienteMock(clientes: Cliente[] = [mockCliente()]) {
  return {
    listar: vi.fn().mockReturnValue(of(clientes)),
    adicionar: vi.fn().mockReturnValue(of(mockCliente())),
    editar: vi.fn().mockReturnValue(of(mockCliente())),
    excluir: vi.fn().mockReturnValue(of(undefined))
  };
}

describe('ClientsComponent', () => {
  let component: ClientsComponent;
  let clienteMock: ReturnType<typeof makeClienteMock>;

  beforeEach(() => {
    clienteMock = makeClienteMock();
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ClientsComponent],
      providers: [{ provide: ClienteService, useValue: clienteMock }]
    });
    component = TestBed.createComponent(ClientsComponent).componentInstance;
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ─── carregarClientes ────────────────────────────────────────────────────

  describe('carregarClientes', () => {
    it('should populate listaClientes on success', () => {
      component.ngOnInit();
      expect(component.listaClientes.length).toBe(1);
      expect(component.listaClientes[0].name).toBe('Ana Beatriz');
    });

    it('should set carregando=false after load', () => {
      component.ngOnInit();
      expect(component.carregando()).toBe(false);
    });

    it('should set erro message on failure', () => {
      clienteMock.listar.mockReturnValue(throwError(() => new Error('fail')));
      component.carregarClientes();
      expect(component.erro()).toContain('Erro');
      expect(component.carregando()).toBe(false);
    });

    it('should call listar with page=0 and size=100', () => {
      component.ngOnInit();
      expect(clienteMock.listar).toHaveBeenCalledWith(0, 100);
    });
  });

  // ─── filtrarClientes ─────────────────────────────────────────────────────

  describe('filtrarClientes', () => {
    beforeEach(() => {
      component.listaClientes = [
        mockCliente({ name: 'Ana Beatriz', email: 'ana@email.com', cpf: '111' }),
        mockCliente({ id: 'uuid-2', name: 'Carlos Silva', email: 'carlos@email.com', cpf: '222' }),
        mockCliente({ id: 'uuid-3', name: 'Maria Costa', email: 'maria@email.com', cpf: '333' })
      ];
    });

    it('should show all when termoBusca is empty', () => {
      component.termoBusca = '';
      component.filtrarClientes();
      expect(component.clientesFiltrados().length).toBe(3);
    });

    it('should filter by name', () => {
      component.termoBusca = 'carlos';
      component.filtrarClientes();
      expect(component.clientesFiltrados().every(c => c.name.toLowerCase().includes('carlos'))).toBe(true);
    });

    it('should filter by email', () => {
      component.termoBusca = 'maria@';
      component.filtrarClientes();
      expect(component.clientesFiltrados().length).toBe(1);
    });

    it('should filter by cpf', () => {
      component.termoBusca = '333';
      component.filtrarClientes();
      expect(component.clientesFiltrados()[0].cpf).toBe('333');
    });

    it('should return empty array for no match', () => {
      component.termoBusca = 'xyznotfound';
      component.filtrarClientes();
      expect(component.clientesFiltrados().length).toBe(0);
    });
  });

  // ─── modais ──────────────────────────────────────────────────────────────

  describe('modal: adicionar', () => {
    it('should open modal', () => {
      component.abrirModalAdicionar();
      expect(component.modalAdicionarAberto).toBe(true);
    });

    it('should close modal and reload on success', () => {
      component.abrirModalAdicionar();
      component.fecharModalAdicionar(true);
      expect(component.modalAdicionarAberto).toBe(false);
      expect(clienteMock.listar).toHaveBeenCalledTimes(1); // reload
    });

    it('should close modal WITHOUT reload on cancel', () => {
      component.abrirModalAdicionar();
      const callsBefore = clienteMock.listar.mock.calls.length;
      component.fecharModalAdicionar(false);
      expect(component.modalAdicionarAberto).toBe(false);
      expect(clienteMock.listar.mock.calls.length).toBe(callsBefore);
    });
  });

  describe('modal: editar', () => {
    const cliente = mockCliente();

    it('should open modal with a copy of client', () => {
      component.abrirModalEditar(cliente);
      expect(component.modalEditarAberto).toBe(true);
      expect(component.clienteSelecionado).toEqual(cliente);
      expect(component.clienteSelecionado).not.toBe(cliente); // deep copy
    });

    it('should close and reload on success', () => {
      component.fecharModalEditar(true);
      expect(component.modalEditarAberto).toBe(false);
      expect(clienteMock.listar).toHaveBeenCalled();
    });

    it('should clear clienteSelecionado on close', () => {
      component.abrirModalEditar(cliente);
      component.fecharModalEditar(false);
      expect(component.clienteSelecionado).toBeNull();
    });
  });

  describe('modal: excluir', () => {
    const cliente = mockCliente();

    it('should open modal with client reference', () => {
      component.abrirModalExcluir(cliente);
      expect(component.modalExcluirAberto).toBe(true);
      expect(component.clienteSelecionado).toBe(cliente);
    });

    it('should close and reload on success', () => {
      component.fecharModalExcluir(true);
      expect(component.modalExcluirAberto).toBe(false);
      expect(clienteMock.listar).toHaveBeenCalled();
    });

    it('should NOT reload on cancel', () => {
      const before = clienteMock.listar.mock.calls.length;
      component.fecharModalExcluir(false);
      expect(clienteMock.listar.mock.calls.length).toBe(before);
    });
  });
});
