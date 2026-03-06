import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tag, TagVariant } from '../../components/tags/tags';
import { Buttons } from '../../components/buttons/buttons';
import QRCode from 'qrcode';

@Component({
  selector: 'app-viagens',
  standalone: true,
  imports: [CommonModule, Tag, Buttons],
  templateUrl: './viagens.html',
  styleUrls: ['./viagens.css']
})
export class Viagens implements OnInit, OnDestroy {
  // Countdown timer
  countdown = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  private countdownInterval: any = null;

  // QR Code
  qrCodeDataUrl: string = '';

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown(): void {
    // Data da próxima viagem (exemplo: 2 dias no futuro para demo)
    const nextTripDate = new Date();
    nextTripDate.setDate(nextTripDate.getDate() + 2);
    nextTripDate.setHours(8, 0, 0, 0);

    this.updateCountdown(nextTripDate);

    this.countdownInterval = setInterval(() => {
      this.updateCountdown(nextTripDate);
    }, 1000);
  }

  private updateCountdown(targetDate: Date): void {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance > 0) {
      this.countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    } else {
      this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  }

  // Carousel state for scheduled trips
  scheduledScrollIndex = 0;

  // Cancel trip popup state
  showCancelPopup = false;
  cancelTripRef: any = null;

  // Ticket popup state
  showTicketPopup = false;
  ticketTripRef: any = null;
  ticketCode = 'ABC123';

  async openTicketPopup(trip: any): Promise<void> {
    this.ticketTripRef = trip;
    this.showTicketPopup = true;

    // Gerar QR Code
    const ticketData = JSON.stringify({
      code: this.ticketCode,
      trip: `${trip.origin} → ${trip.destination}`,
      date: `${trip.day}/${trip.month}`,
      time: trip.time,
      passenger: 'Passageiro VanVan',
      vehicle: trip.vehicle
    });

    try {
      this.qrCodeDataUrl = await QRCode.toDataURL(ticketData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1B1B1F',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
    }
  }

  closeTicketPopup(): void {
    this.showTicketPopup = false;
    this.ticketTripRef = null;
  }

  openCancelPopup(trip: any): void {
    this.cancelTripRef = trip;
    this.showCancelPopup = true;
  }

  closeCancelPopup(): void {
    this.showCancelPopup = false;
    this.cancelTripRef = null;
  }

  confirmCancelTrip(): void {
    // TODO: integrate with backend to actually cancel the trip
    console.log('Trip cancelled:', this.cancelTripRef);
    this.closeCancelPopup();
  }

  nextTrip = {
    month: 'FEV',
    day: '10',
    time: '08:00',
    origin: 'Garanhuns',
    destination: 'Recife',
    price: 'R$40,00',
    vehicle: 'Sprinter 2025 XXXX-XXX',
    pickupPoint: 'Rodoviária - Garanhuns',
    driverName: 'Nome do motorista',
    driverContact: 'Contato do motorista',
    driverRating: 4.8,
    variant: 'success' as TagVariant,
    statusLabel: 'Confirmado',
  };

  scheduledTrips = [
    {
      month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife',
      price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX',
      pickupPoint: 'Rodoviária - Garanhuns',
      driverName: 'Nome do motorista', driverContact: 'Contato do motorista',
      driverRating: 4.8,
      variant: 'warning' as TagVariant, statusLabel: 'Aguardando',
    },
    {
      month: 'FEV', day: '15', origin: 'Recife', destination: 'Garanhuns',
      price: 'R$40,00', time: '14:00', vehicle: 'Sprinter 2025 XXXX-XXX',
      pickupPoint: 'Rodoviária - Recife',
      driverName: 'Nome do motorista', driverContact: 'Contato do motorista',
      driverRating: 4.5,
      variant: 'success' as TagVariant, statusLabel: 'Confirmado',
    },
  ];

  pastTrips = [
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', variant: 'success' as TagVariant, statusLabel: 'Finalizado' },
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', variant: 'success' as TagVariant, statusLabel: 'Finalizado' },
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', variant: 'success' as TagVariant, statusLabel: 'Finalizado' },
  ];

  get currentScheduledTrip() {
    return this.scheduledTrips[this.scheduledScrollIndex] ?? this.scheduledTrips[0];
  }

  prevScheduled(): void {
    if (this.scheduledScrollIndex > 0) {
      this.scheduledScrollIndex--;
    }
  }

  nextScheduled(): void {
    if (this.scheduledScrollIndex < this.scheduledTrips.length - 1) {
      this.scheduledScrollIndex++;
    }
  }

  // Share trip via Web Share API
  async shareTrip(trip: any): Promise<void> {
    const shareData = {
      title: 'Minha Viagem VanVan',
      text: `Viagem de ${trip.origin} para ${trip.destination} no dia ${trip.day}/${trip.month} às ${trip.time}. Preço: ${trip.price}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.text}\n${shareData.url}`;
      await navigator.clipboard.writeText(text);
      alert('Link copiado para a área de transferência!');
    }
  }
}
