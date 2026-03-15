import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { ApproveDrivers } from './approve-drivers';
import { AdminService, DriverAdmin } from '../../services/admin.service';

const mockDriver = (overrides: Partial<DriverAdmin> = {}): DriverAdmin => ({
  id: 'uuid-1',
  name: 'João Silva',
  email: 'joao@test.com',
  phone: '81999999999',
  cpf: '123.456.789-00',
  cnh: '12345678900',
  birthDate: '1990-01-15',
  registrationStatus: 'PENDING',
  rejectionReason: null,
  ...overrides
});

const makePage = (drivers: DriverAdmin[], total = drivers.length) => ({
  content: drivers,
  totalElements: total,
  totalPages: Math.ceil(total / 10),
  number: 0,
  size: 10
});

function makeAdminMock() {
  return {
    listDrivers: vi.fn().mockReturnValue(of(makePage([mockDriver()]))),
    updateDriverStatus: vi.fn().mockReturnValue(of(mockDriver({ registrationStatus: 'APPROVED' }))),
    getDriverVehicles: vi.fn().mockReturnValue(of([]))
  };
}

describe('ApproveDrivers', () => {
  let component: ApproveDrivers;
  let adminMock: ReturnType<typeof makeAdminMock>;

  beforeEach(() => {
    adminMock = makeAdminMock();
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ApproveDrivers],
      providers: [
        { provide: AdminService, useValue: adminMock },
        { provide: HttpClient, useValue: { get: vi.fn().mockReturnValue(of(new Blob())) } }
      ]
    });
    component = TestBed.createComponent(ApproveDrivers).componentInstance;
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call loadDrivers and loadCounts', () => {
      component.ngOnInit();
      // loadDrivers + loadCounts (PENDING count + REJECTED count) = 3 calls
      expect(adminMock.listDrivers).toHaveBeenCalledTimes(3);
    });

    it('should populate drivers signal', () => {
      component.ngOnInit();
      expect(component.drivers().length).toBe(1);
      expect(component.drivers()[0].name).toBe('João Silva');
    });

    it('should set loading=false after load', () => {
      component.ngOnInit();
      expect(component.loading()).toBe(false);
    });

    it('should set error message when loadDrivers fails', () => {
      // Primeira chamada (loadDrivers) lanca erro; as demais (loadCounts x2) retornam sucesso
      adminMock.listDrivers
        .mockReturnValueOnce(throwError(() => new Error('network')))
        .mockReturnValue(of(makePage([])));
      component.ngOnInit();
      expect(component.error()).toContain('Erro');
      expect(component.loading()).toBe(false);
    });
  });

  // ─── switchTab ────────────────────────────────────────────────────────────

  describe('switchTab', () => {
    it('should change activeTab and reload', () => {
      component.ngOnInit();
      vi.clearAllMocks();
      component.switchTab('REJECTED');
      expect(component.activeTab()).toBe('REJECTED');
      expect(adminMock.listDrivers).toHaveBeenCalled();
    });

    it('should NOT reload when switching to the same tab', () => {
      component.ngOnInit();
      vi.clearAllMocks();
      component.switchTab('PENDING'); // already PENDING
      expect(adminMock.listDrivers).not.toHaveBeenCalled();
    });

    it('should reset currentPage to 0 on tab switch', () => {
      component.currentPage.set(2);
      component.switchTab('REJECTED');
      expect(component.currentPage()).toBe(0);
    });
  });

  // ─── approve ─────────────────────────────────────────────────────────────

  describe('approve', () => {
    it('should call updateDriverStatus with APPROVED', () => {
      component.approve(mockDriver());
      expect(adminMock.updateDriverStatus).toHaveBeenCalledWith('uuid-1', 'APPROVED');
    });

    it('should reload drivers after approval', () => {
      component.ngOnInit();
      vi.clearAllMocks();
      component.approve(mockDriver());
      expect(adminMock.listDrivers).toHaveBeenCalled();
    });
  });

  // ─── reject modal ─────────────────────────────────────────────────────────

  describe('reject / confirmReject / cancelReject', () => {
    it('should open reject modal', () => {
      component.reject(mockDriver());
      expect(component.showRejectModal()).toBe(true);
    });

    it('should NOT confirm reject when reason is empty', () => {
      component.reject(mockDriver());
      component.rejectReason = '';
      component.confirmReject();
      expect(adminMock.updateDriverStatus).not.toHaveBeenCalled();
    });

    it('should call updateDriverStatus with REJECTED and reason', () => {
      component.reject(mockDriver());
      component.rejectReason = 'CNH inválida';
      component.confirmReject();
      expect(adminMock.updateDriverStatus).toHaveBeenCalledWith('uuid-1', 'REJECTED', 'CNH inválida');
    });

    it('should close modal after confirm', () => {
      component.reject(mockDriver());
      component.rejectReason = 'motivo';
      component.confirmReject();
      expect(component.showRejectModal()).toBe(false);
    });

    it('should close modal on cancelReject', () => {
      component.reject(mockDriver());
      component.cancelReject();
      expect(component.showRejectModal()).toBe(false);
    });
  });

  // ─── filtrarMotoristas ───────────────────────────────────────────────────

  describe('filtrarMotoristas', () => {
    beforeEach(() => {
      component.listaMotoristas = [
        mockDriver({ name: 'João Silva', cpf: '111' }),
        mockDriver({ id: 'uuid-2', name: 'Maria Lima', cpf: '222' }),
        mockDriver({ id: 'uuid-3', name: 'Pedro Alves', cnh: '99999', cpf: '333' })
      ];
    });

    it('should show all when termoBusca is empty', () => {
      component.termoBusca = '';
      component.filtrarMotoristas();
      expect(component.drivers().length).toBe(3);
    });

    it('should filter by name', () => {
      component.termoBusca = 'maria';
      component.filtrarMotoristas();
      expect(component.drivers().every(d => d.name.toLowerCase().includes('maria'))).toBe(true);
    });

    it('should filter by cpf', () => {
      component.termoBusca = '222';
      component.filtrarMotoristas();
      expect(component.drivers()[0].cpf).toBe('222');
    });

    it('should return empty array for no match', () => {
      component.termoBusca = 'xyznotfound';
      component.filtrarMotoristas();
      expect(component.drivers().length).toBe(0);
    });
  });

  // ─── shortId ─────────────────────────────────────────────────────────────

  describe('shortId', () => {
    it('should return first 8 chars uppercased', () => {
      expect(component.shortId('abcdefgh1234')).toBe('ABCDEFGH');
    });
  });

  // ─── openDetails ─────────────────────────────────────────────────────────

  describe('openDetails', () => {
    it('should open details modal and load vehicles', () => {
      adminMock.getDriverVehicles.mockReturnValue(of([{ id: 'v1', modelName: 'Sprinter' }]));
      component.openDetails(mockDriver());
      expect(component.showDetailsModal()).toBe(true);
      expect(component.selectedVehicles().length).toBe(1);
    });

    it('should set empty vehicles on error', () => {
      adminMock.getDriverVehicles.mockReturnValue(throwError(() => new Error('fail')));
      component.openDetails(mockDriver());
      expect(component.selectedVehicles()).toEqual([]);
      expect(component.loadingDetails()).toBe(false);
    });
  });
});