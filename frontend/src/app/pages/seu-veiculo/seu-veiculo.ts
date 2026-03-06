import { Component, ViewChild, ElementRef, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Toggle } from '../../components/toggle/toggle';
import { Textfield } from '../../components/textfield/textfield';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast/toast.service';

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  imageUrl: string;
  documentUrl: string | null;
  isSelected: boolean;
}

@Component({
  selector: 'app-seu-veiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, Toggle, Textfield],
  templateUrl: './seu-veiculo.html',
  styleUrls: ['./seu-veiculo.css'],
})
export class SeuVeiculo {
  constructor(
    private router: Router,
    private vehicleService: VehicleService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    // Usar effect para reagir quando o usuário for carregado
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.vehiclesLoaded) {
        this.vehiclesLoaded = true;
        this.loadVehiclesForUser(user.id);
      }
    });
  }

  // ===== Loading & Error State =====
  isLoading = true; // Começa como true para mostrar loading imediatamente
  errorMessage = '';

  // ===== Rating =====
  rating = 4.8;

  // ===== Trip Stats =====
  tripsCurrentMonth = 250;
  tripsPreviousMonth = 120;

  // ===== Distance =====
  averageDistance = '68km';

  // ===== Preferences =====
  airConditioningEnabled = true;
  acceptsPets = false;
  largeLuggageEnabled = true;

  // ===== Vehicle Form Popup (Add / Edit) =====
  popupMode: 'add' | 'edit' | null = null;
  editingVehicle: Vehicle | null = null;
  newVehicleModel = '';
  newVehiclePlate = '';
  vehicleDocument: File | null = null;
  vehiclePhoto: File | null = null;
  isSubmitting = false;

  // URLs dos documentos existentes (para modo de edição)
  existingDocumentUrl: string | null = null;
  existingPhotoUrl: string | null = null;

  // ===== Delete Popup =====
  showDeletePopup = false;
  vehicleToDelete: Vehicle | null = null;

  // ===== Popup Position =====
  @ViewChild('vehiclesCard', { static: false }) vehiclesCard!: ElementRef;
  popupTop = 0;
  popupRight = 0;

  // ===== Vehicles =====
  vehicles: Vehicle[] = [];
  private vehiclesLoaded = false;

  private loadVehiclesForUser(userId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.vehicleService.getVehiclesByDriver(userId).subscribe({
      next: (response) => {
        this.vehicles = response.map((v, index) => ({
          id: v.id,
          model: v.modelName,
          plate: v.licensePlate,
          imageUrl: v.photoPath ? this.vehicleService.getVehiclePhotoUrl(v.id) : 'assets/VAN-EMPTY.png',
          documentUrl: v.documentPath ? this.vehicleService.getVehicleDocumentUrl(v.id) : null,
          isSelected: index === 0
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar veículos:', err);
        this.errorMessage = 'Erro ao carregar veículos. Tente novamente.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadVehicles(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.errorMessage = 'Usuário não autenticado';
      return;
    }
    this.loadVehiclesForUser(user.id);
  }

  // ===== Bar Chart =====
  get currentMonthBarWidth(): number {
    const max = Math.max(this.tripsCurrentMonth, this.tripsPreviousMonth);
    return max > 0 ? (this.tripsCurrentMonth / max) * 100 : 0;
  }

  get previousMonthBarWidth(): number {
    const max = Math.max(this.tripsCurrentMonth, this.tripsPreviousMonth);
    return max > 0 ? (this.tripsPreviousMonth / max) * 100 : 0;
  }

  // ===== Vehicle Actions =====
  selectVehicle(vehicle: Vehicle): void {
    this.vehicles.forEach(v => (v.isSelected = false));
    vehicle.isSelected = true;
  }

  deleteVehicle(vehicle: Vehicle): void {
    this.closeFormPopup();
    this.vehicleToDelete = vehicle;
    this.showDeletePopup = true;
    this.calculatePopupPosition();
  }

  confirmDelete(): void {
    if (this.vehicleToDelete) {
      this.isSubmitting = true;
      this.vehicleService.deleteVehicle(this.vehicleToDelete.id).subscribe({
        next: () => {
          const wasSelected = this.vehicleToDelete!.isSelected;
          this.vehicles = this.vehicles.filter(v => v.id !== this.vehicleToDelete!.id);
          if (wasSelected && this.vehicles.length > 0) {
            this.vehicles[0].isSelected = true;
          }
          this.isSubmitting = false;
          this.closeDeletePopup();
          this.toastService.success('Veículo removido com sucesso!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao deletar veículo:', err);
          this.toastService.error('Erro ao deletar veículo. Tente novamente.');
          this.isSubmitting = false;
          this.closeDeletePopup();
          this.cdr.detectChanges();
        }
      });
    } else {
      this.closeDeletePopup();
    }
  }

  closeDeletePopup(): void {
    this.showDeletePopup = false;
    this.vehicleToDelete = null;
  }

  editVehicle(vehicle: Vehicle): void {
    this.closeDeletePopup();
    this.errorMessage = '';
    this.editingVehicle = vehicle;
    this.newVehicleModel = vehicle.model;
    this.newVehiclePlate = vehicle.plate;
    this.vehicleDocument = null;
    this.vehiclePhoto = null;

    // Carregar URLs dos documentos existentes
    this.existingDocumentUrl = vehicle.documentUrl;
    this.existingPhotoUrl = vehicle.imageUrl !== 'assets/VAN-EMPTY.png' ? vehicle.imageUrl : null;

    this.popupMode = 'edit';
    this.calculatePopupPosition();
  }

  addVehicle(): void {
    this.closeDeletePopup();
    if (this.popupMode === 'add') {
      this.closeFormPopup();
      return;
    }
    this.errorMessage = '';
    this.newVehicleModel = '';
    this.newVehiclePlate = '';
    this.vehicleDocument = null;
    this.vehiclePhoto = null;
    this.existingDocumentUrl = null;
    this.existingPhotoUrl = null;
    this.editingVehicle = null;
    this.popupMode = 'add';
    this.calculatePopupPosition();
  }

  closeFormPopup(): void {
    this.popupMode = null;
    this.editingVehicle = null;
    this.errorMessage = '';
    this.existingDocumentUrl = null;
    this.existingPhotoUrl = null;
  }

  closeAllPopups(): void {
    this.closeFormPopup();
    this.closeDeletePopup();
  }

  private calculatePopupPosition(): void {
    if (this.vehiclesCard) {
      const rect = this.vehiclesCard.nativeElement.getBoundingClientRect();
      this.popupTop = rect.top;
      this.popupRight = window.innerWidth - rect.left + 24;
    }
  }

  selectDocument(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e: any) => {
      this.vehicleDocument = e.target.files[0];
    };
    input.click();
  }

  selectPhoto(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      this.vehiclePhoto = e.target.files[0];
    };
    input.click();
  }

  submitVehicle(): void {
    this.errorMessage = '';

    // Validação de campos obrigatórios
    if (!this.newVehicleModel || !this.newVehicleModel.trim()) {
      this.errorMessage = 'Preencha o modelo do veículo.';
      return;
    }

    if (!this.newVehiclePlate || !this.newVehiclePlate.trim()) {
      this.errorMessage = 'Preencha a placa do veículo.';
      return;
    }

    // Validação da placa no formato Mercosul (ABC1D23)
    const plateRegex = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;
    const normalizedPlate = this.newVehiclePlate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!plateRegex.test(normalizedPlate)) {
      this.errorMessage = 'Placa inválida. Use o formato Mercosul (ABC1D23).';
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      this.errorMessage = 'Usuário não autenticado';
      return;
    }

    // Validação de documento obrigatório para novo veículo
    if (this.popupMode === 'add' && !this.vehicleDocument) {
      this.errorMessage = 'O documento do veículo é obrigatório.';
      return;
    }

    // Validação do tipo de documento (apenas PDF)
    if (this.vehicleDocument) {
      const allowedDocTypes = ['application/pdf'];
      if (!allowedDocTypes.includes(this.vehicleDocument.type)) {
        this.errorMessage = 'O documento deve ser um arquivo PDF.';
        return;
      }
      // Validação de tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (this.vehicleDocument.size > maxSize) {
        this.errorMessage = 'O documento deve ter no máximo 10MB.';
        return;
      }
    }

    // Validação do tipo de foto (apenas imagens)
    if (this.vehiclePhoto) {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedImageTypes.includes(this.vehiclePhoto.type)) {
        this.errorMessage = 'A foto deve ser uma imagem (JPEG ou PNG).';
        return;
      }
      // Validação de tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (this.vehiclePhoto.size > maxSize) {
        this.errorMessage = 'A foto deve ter no máximo 10MB.';
        return;
      }
    }

    this.isSubmitting = true;

    if (this.popupMode === 'edit' && this.editingVehicle) {
      // Atualizar veículo existente
      this.vehicleService.updateVehicle(
        this.editingVehicle.id,
        this.newVehicleModel.trim(),
        normalizedPlate,
        this.vehicleDocument ?? undefined,
        this.vehiclePhoto ?? undefined
      ).subscribe({
        next: (response) => {
          // Atualiza o veículo na lista local
          const index = this.vehicles.findIndex(v => v.id === this.editingVehicle!.id);
          if (index !== -1) {
            this.vehicles[index] = {
              ...this.vehicles[index],
              model: response.modelName,
              plate: response.licensePlate,
              imageUrl: response.photoPath ? this.vehicleService.getVehiclePhotoUrl(response.id) : this.vehicles[index].imageUrl,
              documentUrl: response.documentPath ? this.vehicleService.getVehicleDocumentUrl(response.id) : this.vehicles[index].documentUrl
            };
          }
          this.isSubmitting = false;
          this.closeFormPopup();
          this.toastService.success('Veículo atualizado com sucesso!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao atualizar veículo:', err);
          this.errorMessage = err.error?.message || 'Erro ao atualizar veículo. Verifique os dados e tente novamente.';
          this.toastService.error(this.errorMessage);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Criar novo veículo
      this.vehicleService.createVehicle(
        user.id,
        this.newVehicleModel.trim(),
        normalizedPlate,
        this.vehicleDocument!,
        this.vehiclePhoto ?? undefined
      ).subscribe({
        next: (response) => {
          this.vehicles.push({
            id: response.id,
            model: response.modelName,
            plate: response.licensePlate,
            imageUrl: response.photoPath ? this.vehicleService.getVehiclePhotoUrl(response.id) : 'assets/VAN-EMPTY.png',
            documentUrl: response.documentPath ? this.vehicleService.getVehicleDocumentUrl(response.id) : null,
            isSelected: this.vehicles.length === 0
          });
          this.isSubmitting = false;
          this.closeFormPopup();
          this.toastService.success('Veículo cadastrado com sucesso!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao criar veículo:', err);
          this.errorMessage = err.error?.message || 'Erro ao criar veículo. Verifique os dados e tente novamente.';
          this.toastService.error(this.errorMessage);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ===== Navigation =====
  goBack(): void {
    this.router.navigate(['/motorista']);
  }
}
