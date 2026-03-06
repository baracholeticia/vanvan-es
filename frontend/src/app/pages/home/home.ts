import { Component, inject, OnInit, OnDestroy, HostListener, ElementRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tag, TagVariant } from '../../components/tags/tags';
import { Buttons } from '../../components/buttons/buttons';
import { CityService, City } from '../../services/city.service';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, Tag, Buttons],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private cityService = inject(CityService);
  private elementRef = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  // Typed text effect
  typedDestinations = ['Recife', 'Garanhuns', 'Caruaru', 'Petrolina', 'João Pessoa'];
  currentDestination = '';
  private typedIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typingInterval: any = null;

  // City autocomplete
  partidaQuery = '';
  destinoQuery = '';
  partidaSuggestions: City[] = [];
  destinoSuggestions: City[] = [];
  showPartidaDropdown = false;
  showDestinoDropdown = false;

  private partidaSearch$ = new Subject<string>();
  private destinoSearch$ = new Subject<string>();

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Start typing effect
    this.startTypingEffect();

    // Preload cities on init
    this.cityService.getAllCities().subscribe();

    this.partidaSearch$.pipe(
      debounceTime(250),
      switchMap(query => this.cityService.searchCities(query))
    ).subscribe(cities => {
      this.partidaSuggestions = cities;
      this.showPartidaDropdown = cities.length > 0;
    });

    this.destinoSearch$.pipe(
      debounceTime(250),
      switchMap(query => this.cityService.searchCities(query))
    ).subscribe(cities => {
      this.destinoSuggestions = cities;
      this.showDestinoDropdown = cities.length > 0;
    });
  }

  ngOnDestroy(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  private startTypingEffect(): void {
    const typeSpeed = 100;
    const deleteSpeed = 50;
    const pauseTime = 2000;

    const type = () => {
      const currentWord = this.typedDestinations[this.typedIndex];

      if (this.isDeleting) {
        this.currentDestination = currentWord.substring(0, this.charIndex - 1);
        this.charIndex--;

        if (this.charIndex === 0) {
          this.isDeleting = false;
          this.typedIndex = (this.typedIndex + 1) % this.typedDestinations.length;
          setTimeout(type, 500);
          return;
        }
        setTimeout(type, deleteSpeed);
      } else {
        this.currentDestination = currentWord.substring(0, this.charIndex + 1);
        this.charIndex++;

        if (this.charIndex === currentWord.length) {
          this.isDeleting = true;
          setTimeout(type, pauseTime);
          return;
        }
        setTimeout(type, typeSpeed);
      }
    };

    type();
  }

  onPartidaInput(): void {
    this.partidaSearch$.next(this.partidaQuery);
  }

  onDestinoInput(): void {
    this.destinoSearch$.next(this.destinoQuery);
  }

  selectPartida(city: City): void {
    this.partidaQuery = city.label;
    this.showPartidaDropdown = false;
  }

  selectDestino(city: City): void {
    this.destinoQuery = city.label;
    this.showDestinoDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showPartidaDropdown = false;
      this.showDestinoDropdown = false;
    }
  }

  scheduledTrips = [
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'success' as TagVariant, statusLabel: 'Confirmado', isFirst: true },
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'warning' as TagVariant, statusLabel: 'Aguardando', isFirst: false },
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'error' as TagVariant, statusLabel: 'Recusado', isFirst: false },
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'error' as TagVariant, statusLabel: 'Recusado', isFirst: false },
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', time: '08:00', vehicle: 'Sprinter 2025 XXXX-XXX', variant: 'error' as TagVariant, statusLabel: 'Recusado', isFirst: false },
  ];

  pastTrips = [
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', variant: 'success' as TagVariant, statusLabel: 'Finalizado' },
    { month: 'FEV', day: '10', origin: 'Garanhuns', destination: 'Recife', price: 'R$40,00', variant: 'success' as TagVariant, statusLabel: 'Finalizado' },
  ];

  // Date field
  dataViagem = '';

  // Passengers field
  passageiros = 1;

  get passageirosLabel(): string {
    return this.passageiros === 1 ? '1 Passageiro' : `${this.passageiros} Passageiros`;
  }

  decrementPassageiros(): void {
    if (this.passageiros > 1) this.passageiros--;
  }

  incrementPassageiros(): void {
    if (this.passageiros < 5) this.passageiros++;
  }
}
