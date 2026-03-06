import { Component, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast/toast.service';

interface PricingConfig {
  defaultRatePerKm: number;  // Valor padrão definido pelo admin
  driverRatePerKm: number;   // Valor personalizado do motorista
  minVariation: number;      // Variação mínima permitida (ex: -20%)
  maxVariation: number;      // Variação máxima permitida (ex: +30%)
}

interface RoutePreview {
  origin: string;
  destination: string;
  distance: number;
  estimatedPrice: number;
}

@Component({
  selector: 'app-ajustar-valores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ajustar-valores.html',
  styleUrls: ['./ajustar-valores.css']
})
export class AjustarValores {

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    // Carregar configurações quando o usuário estiver disponível
    effect(() => {
      const user = this.authService.currentUser();
      if (user && !this.configLoaded) {
        this.configLoaded = true;
        this.loadPricingConfig(user.id);
      }
    });
  }

  // ===== State =====
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  private configLoaded = false;

  // ===== Pricing Configuration =====
  // TODO: Carregar do backend quando disponível
  pricingConfig: PricingConfig = {
    defaultRatePerKm: 0.70,   // R$0,70/km definido pelo admin
    driverRatePerKm: 0.70,    // Valor atual do motorista
    minVariation: -20,        // Pode cobrar até 20% menos
    maxVariation: 30          // Pode cobrar até 30% mais
  };

  // Valor temporário sendo editado
  editingRate: number = 0.70;

  // ===== Route Previews =====
  routePreviews: RoutePreview[] = [
    { origin: 'Garanhuns', destination: 'Recife', distance: 230, estimatedPrice: 0 },
    { origin: 'Garanhuns', destination: 'Caruaru', distance: 120, estimatedPrice: 0 },
    { origin: 'Caruaru', destination: 'Recife', distance: 130, estimatedPrice: 0 },
    { origin: 'Garanhuns', destination: 'Maceió', distance: 280, estimatedPrice: 0 }
  ];

  // ===== Computed Values =====
  get minAllowedRate(): number {
    return this.pricingConfig.defaultRatePerKm * (1 + this.pricingConfig.minVariation / 100);
  }

  get maxAllowedRate(): number {
    return this.pricingConfig.defaultRatePerKm * (1 + this.pricingConfig.maxVariation / 100);
  }

  get currentVariationPercent(): number {
    if (this.pricingConfig.defaultRatePerKm === 0) return 0;
    return ((this.editingRate - this.pricingConfig.defaultRatePerKm) / this.pricingConfig.defaultRatePerKm) * 100;
  }

  get isRateValid(): boolean {
    return this.editingRate >= this.minAllowedRate && this.editingRate <= this.maxAllowedRate;
  }

  get hasChanges(): boolean {
    return Math.abs(this.editingRate - this.pricingConfig.driverRatePerKm) > 0.001;
  }

  get sliderPercent(): number {
    const range = this.maxAllowedRate - this.minAllowedRate;
    if (range === 0) return 50;
    return ((this.editingRate - this.minAllowedRate) / range) * 100;
  }

  get defaultMarkerPercent(): number {
    const range = this.maxAllowedRate - this.minAllowedRate;
    if (range === 0) return 50;
    return ((this.pricingConfig.defaultRatePerKm - this.minAllowedRate) / range) * 100;
  }

  // ===== Methods =====
  onSliderChange(): void {
    // Arredondar para 2 casas decimais
    this.editingRate = Math.round(this.editingRate * 100) / 100;
    this.updateRoutePreview();
  }

  private loadPricingConfig(userId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    // TODO: Implementar chamada à API quando disponível
    // this.pricingService.getDriverPricing(userId).subscribe({...})

    // Simulando carregamento
    setTimeout(() => {
      this.editingRate = this.pricingConfig.driverRatePerKm;
      this.updateRoutePreview();
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 500);
  }

  updateRoutePreview(): void {
    this.routePreviews = this.routePreviews.map(route => ({
      ...route,
      estimatedPrice: route.distance * this.editingRate
    }));
  }

  onRateChange(): void {
    // Garantir que o valor está dentro dos limites
    if (this.editingRate < this.minAllowedRate) {
      this.editingRate = this.minAllowedRate;
    } else if (this.editingRate > this.maxAllowedRate) {
      this.editingRate = this.maxAllowedRate;
    }
    this.updateRoutePreview();
  }

  adjustRate(delta: number): void {
    const newRate = Math.round((this.editingRate + delta) * 100) / 100;
    if (newRate >= this.minAllowedRate && newRate <= this.maxAllowedRate) {
      this.editingRate = newRate;
      this.updateRoutePreview();
    }
  }

  setToDefault(): void {
    this.editingRate = this.pricingConfig.defaultRatePerKm;
    this.updateRoutePreview();
  }

  setToMin(): void {
    this.editingRate = this.minAllowedRate;
    this.updateRoutePreview();
  }

  setToMax(): void {
    this.editingRate = this.maxAllowedRate;
    this.updateRoutePreview();
  }

  saveRate(): void {
    if (!this.isRateValid) {
      this.toastService.error('O valor está fora dos limites permitidos.');
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    // TODO: Implementar chamada à API quando disponível
    // this.pricingService.updateDriverRate(userId, this.editingRate).subscribe({...})

    // Simulando salvamento
    setTimeout(() => {
      this.pricingConfig.driverRatePerKm = this.editingRate;
      this.isSaving = false;
      this.toastService.success('Valor atualizado com sucesso!');
      this.cdr.detectChanges();
    }, 800);
  }

  cancelChanges(): void {
    this.editingRate = this.pricingConfig.driverRatePerKm;
    this.updateRoutePreview();
    this.errorMessage = '';
    this.successMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/motorista']);
  }

  formatCurrency(value: number): string {
    return `R$${value.toFixed(2).replace('.', ',')}`;
  }

  formatVariation(percent: number): string {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(0)}%`;
  }
}

