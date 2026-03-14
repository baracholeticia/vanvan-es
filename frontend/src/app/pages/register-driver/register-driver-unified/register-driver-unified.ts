import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../components/toast/toast.service';

import { StepperComponent } from '../../../components/stepper/stepper.component';
import { StepComponent } from '../../../components/stepper/step.component';

@Component({
  selector: 'app-register-driver-unified',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StepperComponent, StepComponent],
  templateUrl: './register-driver-unified.html',
})
export class RegisterDriverUnified {
  // --- Step 1 Data ---
  name = '';
  email = '';
  cpf = '';
  telephone = '';
  birthdate = '';
  password = '';
  showPassword = signal(false);

  // --- Step 2 Data ---
  cnh = '';
  chavePix = '';
  vehicle = '';
  licensePlate = '';
  licensePlateError = '';

  // Vehicle Files
  vehicleDocument: File | null = null;
  vehicleDocumentName = '';
  vehiclePhoto: File | null = null;
  vehiclePhotoName = '';

  private readonly LICENSE_PLATE_REGEX = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  // --- Step 1 Methods ---
  onCpfInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    this.cpf = value;
    input.value = value;
  }

  onBirthdateInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 4) value = value.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
    else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,2}).*/, '$1/$2');
    this.birthdate = value;
    input.value = value;
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1)$2-$3');
    else if (value.length > 6) value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1)$2-$3');
    else if (value.length > 2) value = value.replace(/^(\d\d)(\d{0,5}).*/, '($1)$2');
    else if (value.length > 0) value = value.replace(/^(\d*)/, '($1');
    this.telephone = value;
    input.value = value;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  // --- Step 2 Methods ---
  onCnhInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    this.cnh = value;
    input.value = value;
  }

  onLicensePlateInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (value.length > 7) value = value.slice(0, 7);
    this.licensePlate = value;
    input.value = value;

    if (value.length === 7) {
      if (!this.LICENSE_PLATE_REGEX.test(value)) {
        this.licensePlateError = 'Formato inválido. Use: ABC1D23';
      } else {
        this.licensePlateError = '';
      }
    } else if (value.length > 0) {
      this.licensePlateError = 'A placa deve ter 7 caracteres';
    } else {
      this.licensePlateError = '';
    }
  }

  onDocumentChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.toastService.error('O documento do veículo deve ser PDF');
        event.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.toastService.error('O arquivo excede 10MB');
        event.target.value = '';
        return;
      }
      this.vehicleDocument = file;
      this.vehicleDocumentName = file.name;
    }
  }

  onPhotoChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.toastService.error('A foto deve ser JPG/PNG');
        event.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.toastService.error('O arquivo excede 10MB');
        event.target.value = '';
        return;
      }
      this.vehiclePhoto = file;
      this.vehiclePhotoName = file.name;
    }
  }

  // --- Submission ---
  onFinalStepCompleted() {
    // Validate Step 1
    if (!this.name || !this.email || !this.password || !this.cpf || !this.telephone || !this.birthdate) {
      this.toastService.error('Preencha os dados pessoais na Etapa 1.');
      return;
    }

    const dateParts = this.birthdate.split('/');
    if (dateParts.length !== 3) {
      this.toastService.error('Data de nascimento inválida.');
      return;
    }

    // Validate Step 2
    if (!this.cnh || !this.chavePix || !this.vehicle) {
      this.toastService.error('Preencha todos os campos obrigatórios da Etapa 2.');
      return;
    }

    if (this.cnh.length !== 11) {
      this.toastService.error('A CNH deve ter 11 dígitos.');
      return;
    }

    if (!this.licensePlate || this.licensePlate.length !== 7 || !this.LICENSE_PLATE_REGEX.test(this.licensePlate)) {
      this.toastService.error('Placa inválida.');
      return;
    }

    if (!this.vehicleDocument) {
      this.toastService.error('Documento do veículo (PDF) é obrigatório.');
      return;
    }

    const motoristaCompleto = {
      name: this.name,
      email: this.email,
      cpf: this.cpf,
      telephone: this.telephone,
      password: this.password,
      cnh: this.cnh,
      pixKey: this.chavePix,
      birthDate: this.birthdate,
      role: 'driver',
      vehicleModelName: this.vehicle,
      vehicleLicensePlate: this.licensePlate,
    };

    this.authService.registerDriverWithVehicle(
      motoristaCompleto,
      this.vehicleDocument,
      this.vehiclePhoto || undefined
    ).subscribe({
      next: () => {
        this.toastService.success('Motorista cadastrado, aguarde aprovação!');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        let msgErro = 'Falha ao realizar cadastro.';
        if (err.error && typeof err.error === 'object' && err.error.message) {
          msgErro = err.error.message;
        } else if (typeof err.error === 'string') {
          msgErro = err.error;
        }
        this.toastService.error(msgErro);
      }
    });
  }
}
