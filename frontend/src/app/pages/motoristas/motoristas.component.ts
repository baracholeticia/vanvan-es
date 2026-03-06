import { Component, OnInit, signal, inject } from '@angular/core';
import { AdminService, DriverAdmin, Vehicle } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MotoristaDeleteComponent } from './components/motorista-delete/motorista-delete.component';
import { MotoristaAdd } from './components/motorista-add/motorista-add';
import { MotoristaEditComponent } from './components/motorista-edit/motorista-edit.component';
import { Tag } from '../../components/tags/tags';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-motoristas',
  standalone: true,
  imports: [CommonModule, FormsModule, MotoristaDeleteComponent, MotoristaAdd, MotoristaEditComponent, Tag],
  templateUrl: './motoristas.component.html',
})
export class MotoristasComponent implements OnInit {

  // --- VARIÁVEIS DE DADOS ---
  listaMotoristas: DriverAdmin[] = [];
  motoristasFiltrados = signal<DriverAdmin[]>([]);
  termoBusca: string = '';
  carregando = signal(false);
  erro = signal('');

  // --- CONTROLE DE MODAIS ---
  modalAdicionarAberto: boolean = false;
  modalEditarAberto: boolean = false;
  modalExcluirAberto: boolean = false;

  // --- MOTORISTA SELECIONADO (Para Edição ou Exclusão) ---
  motoristaSelecionado: DriverAdmin | null = null;

  // Details modal
  showDetailsModal = signal(false);
  selectedDriver = signal<DriverAdmin | null>(null);
  selectedVehicles = signal<Vehicle[]>([]);
  loadingDetails = signal(false);

  private http = inject(HttpClient);

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.carregarMotoristas();
  }

  // --- 1. CARREGAR DADOS ---
  carregarMotoristas(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.adminService.listDrivers(undefined, 0, 100).subscribe({
      next: (page) => {
        this.listaMotoristas = page.content;
        this.filtrarMotoristas();
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar motoristas:', err);
        this.erro.set('Erro ao carregar motoristas.');
        this.carregando.set(false);
      }
    });
  }

  // --- 2. FILTRO DE BUSCA ---
  filtrarMotoristas() {
    if (!this.termoBusca.trim()) {
      this.motoristasFiltrados.set([...this.listaMotoristas]);
    } else {
      const termo = this.termoBusca.toLowerCase();
      this.motoristasFiltrados.set(
        this.listaMotoristas.filter(m =>
          m.name.toLowerCase().includes(termo) ||
          m.cnh.includes(termo) ||
          m.cpf.includes(termo)
        )
      );
    }
  }

  // --- 3. LÓGICA DO MODAL ADICIONAR ---
  abrirModalAdicionar() {
    this.modalAdicionarAberto = true;
  }

  fecharModalAdicionar(sucesso: boolean) {
    this.modalAdicionarAberto = false;
    if (sucesso) {
      this.carregarMotoristas();
    }
  }

  // --- 4. LÓGICA DO MODAL EDITAR ---
  abrirModalEditar(motorista: DriverAdmin) {
    this.motoristaSelecionado = { ...motorista };
    this.modalEditarAberto = true;
  }

  fecharModalEditar(sucesso: boolean) {
    this.modalEditarAberto = false;
    this.motoristaSelecionado = null;
    if (sucesso) {
      this.carregarMotoristas();
    }
  }

  // --- 5. LÓGICA DO MODAL EXCLUIR ---
  abrirModalExcluir(motorista: DriverAdmin) {
    this.motoristaSelecionado = motorista;
    this.modalExcluirAberto = true;
  }

  fecharModalExcluir(sucesso: boolean) {
    this.modalExcluirAberto = false;
    this.motoristaSelecionado = null;
    if (sucesso) {
      this.carregarMotoristas();
    }
  }

  // --- 6. LÓGICA DO MODAL DE DETALHES ---
  openDetails(motorista: DriverAdmin): void {
    this.selectedDriver.set(motorista);
    this.showDetailsModal.set(true);
    this.loadingDetails.set(true);

    this.adminService.getDriverVehicles(motorista.id).subscribe({
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

  shortId(id: string): string {
    return id.substring(0, 8).toUpperCase();
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
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      },
      error: (err) => {
        console.error('Erro ao baixar foto:', err);
        alert('Erro ao carregar foto do veículo.');
      }
    });
  }
}
