import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DriverAdmin, Vehicle } from '../../services/admin.service';
import { Tag } from '../../components/tags/tags';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';

type TabType = 'PENDING' | 'REJECTED';

@Component({
  selector: 'app-approve-drivers',
  standalone: true,
  imports: [CommonModule, Tag, FormsModule],
  templateUrl: './approve-drivers.html',
  styleUrl: './approve-drivers.css',
})
export class ApproveDrivers implements OnInit {
  drivers = signal<DriverAdmin[]>([]);
  loading = signal(true);
  error = signal('');
  activeTab = signal<TabType>('PENDING');
  searchQuery = signal(''); // Não usado, mas mantenho
  termoBusca: string = '';

  // Dados brutos carregados do backend (até 100)
  listaMotoristas: DriverAdmin[] = [];

  // Dados filtrados pela busca (subconjunto de listaMotoristas)
  motoristasFiltrados: DriverAdmin[] = [];

  // Pagination
  currentPage = signal(0);
  totalPages = signal(1);
  totalElements = signal(0);

  // Backend page size (traz tudo)
  backendPageSize = 100;

  // Frontend page size (exibe paginado)
  uiPageSize = 5;

  pendingCount = signal(0);
  rejectedCount = signal(0);

  // Reject modal
  showRejectModal = signal(false);
  rejectReason = '';
  private driverToReject: DriverAdmin | null = null;

  // Details modal
  showDetailsModal = signal(false);
  selectedDriver = signal<DriverAdmin | null>(null);
  selectedVehicles = signal<Vehicle[]>([]);
  loadingDetails = signal(false);

  constructor(
    private adminService: AdminService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDrivers();
    this.loadCounts();
  }

  switchTab(tab: TabType): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.currentPage.set(0);
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading.set(true);
    this.error.set('');
    // Carrega até 100 itens do backend
    this.adminService.listDrivers(this.activeTab(), 0, this.backendPageSize).subscribe({
      next: (page) => {
        // Armazena todos os registros carregados
        this.listaMotoristas = page.content;

        // Inicializa a lista filtrada com todos
        this.filtrarMotoristas();

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar motoristas:', err);
        this.error.set('Erro ao carregar motoristas.');
        this.loading.set(false);
      },
    });
  }

  loadCounts(): void {
    this.adminService.listDrivers('PENDING', 0, 1).subscribe({
      next: (page) => this.pendingCount.set(page.totalElements),
    });
    this.adminService.listDrivers('REJECTED', 0, 1).subscribe({
      next: (page) => this.rejectedCount.set(page.totalElements),
    });
  }

  approve(driver: DriverAdmin): void {
    this.adminService.updateDriverStatus(driver.id, 'APPROVED').subscribe({
      next: () => {
        this.loadDrivers();
        this.loadCounts();
      },
      error: (err) => console.error('Erro ao aprovar:', err),
    });
  }

  reject(driver: DriverAdmin): void {
    this.driverToReject = driver;
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  cancelReject(): void {
    this.showRejectModal.set(false);
    this.driverToReject = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.driverToReject || !this.rejectReason.trim()) return;
    this.adminService.updateDriverStatus(this.driverToReject.id, 'REJECTED', this.rejectReason.trim()).subscribe({
      next: () => {
        this.showRejectModal.set(false);
        this.driverToReject = null;
        this.rejectReason = '';
        this.loadDrivers();
        this.loadCounts();
      },
      error: (err) => console.error('Erro ao rejeitar:', err),
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.updateView();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  shortId(id: string): string {
    return id.substring(0, 8).toUpperCase();
  }

  openDetails(driver: DriverAdmin): void {
    this.selectedDriver.set(driver);
    this.showDetailsModal.set(true);
    this.loadingDetails.set(true);

    this.adminService.getDriverVehicles(driver.id).subscribe({
      next: (vehicles) => {
        this.selectedVehicles.set(vehicles);
        this.loadingDetails.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar veículos:', err);
        this.selectedVehicles.set([]);
        this.loadingDetails.set(false);
      }
    });
  }

  closeDetails(): void {
    this.showDetailsModal.set(false);
    this.selectedDriver.set(null);
    this.selectedVehicles.set([]);
  }

  getVehicleDocumentUrl(vehicleId: string): string {
    return this.adminService.getVehicleDocument(vehicleId);
  }

  getVehiclePhotoUrl(vehicleId: string): string {
    return this.adminService.getVehiclePhoto(vehicleId);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  downloadVehicleDocument(vehicleId: string): void {
    const url = `${environment.apiUrl}/api/vehicles/${vehicleId}/document`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      },
      error: (err) => {
        console.error('Erro ao baixar documento:', err);
        alert('Erro ao carregar documento do veículo.');
      }
    });
  }

  downloadVehiclePhoto(vehicleId: string): void {
    const url = `${environment.apiUrl}/api/vehicles/${vehicleId}/photo`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        // Limpar após um tempo
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      },
      error: (err) => {
        console.error('Erro ao baixar foto:', err);
        alert('Erro ao carregar foto do veículo.');
      }
    });
  }

  filtrarMotoristas() {
    // 1. Aplica o filtro sobre a lista completa
    if (!this.termoBusca.trim()) {
      this.motoristasFiltrados = [...this.listaMotoristas];
    } else {
      const termo = this.termoBusca.toLowerCase();
      this.motoristasFiltrados = this.listaMotoristas.filter(m =>
        m.name.toLowerCase().includes(termo) ||
        m.cnh.includes(termo) ||
        m.cpf.includes(termo)
      );
    }

    // 2. Reseta para a primeira página e atualiza a visualização
    this.currentPage.set(0);
    this.updateView();
  }

  updateView() {
    const total = this.motoristasFiltrados.length;
    this.totalElements.set(total);
    this.totalPages.set(Math.ceil(total / this.uiPageSize) || 1);

    const startIndex = this.currentPage() * this.uiPageSize;
    const endIndex = startIndex + this.uiPageSize;

    const pageContent = this.motoristasFiltrados.slice(startIndex, endIndex);
    this.drivers.set(pageContent);
  }
}
