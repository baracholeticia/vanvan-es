import { Component, Input, OnChanges, SimpleChanges, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GoogleMapsModule, MapDirectionsService, MapDirectionsRenderer, GoogleMap } from '@angular/google-maps';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RoutePoint {
  lat: number;
  lng: number;
  label?: string;
}

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  template: `
    <div class="route-map-container rounded-[16px] overflow-hidden" [style.height]="height">
      <!-- Fallback quando Google Maps não está disponível -->
      <div *ngIf="!mapsAvailable" class="w-full h-full bg-light flex flex-col items-center justify-center gap-3">
        <div class="size-12 bg-subtle-text/50"
          style="-webkit-mask: url(assets/icons/location.svg) no-repeat center / contain; mask: url(assets/icons/location.svg) no-repeat center / contain;">
        </div>
        <span class="text-small text-subtle-text">Mapa não disponível</span>
        <div class="flex items-center gap-2 text-body text-text">
          <span>{{ originLabel }}</span>
          <span class="text-subtle-text">→</span>
          <span>{{ destinationLabel }}</span>
        </div>
        <span class="text-small text-secondary">{{ distanceText }} • {{ durationText }}</span>
      </div>

      <!-- Google Map -->
      <google-map
        *ngIf="mapsAvailable"
        #googleMap
        [height]="height"
        width="100%"
        [center]="center"
        [zoom]="zoom"
        [options]="mapOptions">

        <!-- Origin Marker -->
        <map-marker
          *ngIf="origin"
          [position]="origin"
          [options]="originMarkerOptions">
        </map-marker>

        <!-- Destination Marker -->
        <map-marker
          *ngIf="destination"
          [position]="destination"
          [options]="destinationMarkerOptions">
        </map-marker>

        <!-- Route -->
        <map-directions-renderer
          *ngIf="directionsResults"
          [directions]="directionsResults"
          [options]="directionsOptions">
        </map-directions-renderer>
      </google-map>
    </div>
  `,
  styles: [`
    .route-map-container {
      width: 100%;
      position: relative;
    }

    :host ::ng-deep .gm-style-iw {
      padding: 12px !important;
    }
  `]
})
export class RouteMap implements OnChanges {
  @Input() origin: RoutePoint | null = null;
  @Input() destination: RoutePoint | null = null;
  @Input() originLabel: string = 'Origem';
  @Input() destinationLabel: string = 'Destino';
  @Input() height: string = '300px';
  @Input() showRoute: boolean = true;

  @ViewChild('googleMap') googleMap!: GoogleMap;

  mapsAvailable = false;
  center: google.maps.LatLngLiteral = { lat: -8.89, lng: -36.49 }; // Centro de Pernambuco
  zoom = 8;

  directionsResults: google.maps.DirectionsResult | null = null;
  distanceText: string = '';
  durationText: string = '';

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  originMarkerOptions: google.maps.MarkerOptions = {
    icon: {
      path: google.maps?.SymbolPath?.CIRCLE || 0,
      scale: 10,
      fillColor: '#1E88E5',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3
    }
  };

  destinationMarkerOptions: google.maps.MarkerOptions = {
    icon: {
      path: google.maps?.SymbolPath?.CIRCLE || 0,
      scale: 10,
      fillColor: '#F66B0E',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3
    }
  };

  directionsOptions: google.maps.DirectionsRendererOptions = {
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#1E88E5',
      strokeWeight: 5,
      strokeOpacity: 0.8
    }
  };

  constructor(
    private directionsService: MapDirectionsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.mapsAvailable = typeof google !== 'undefined' && typeof google.maps !== 'undefined';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['origin'] || changes['destination']) && this.origin && this.destination) {
      this.calculateRoute();
    }
  }

  private calculateRoute(): void {
    if (!this.mapsAvailable || !this.origin || !this.destination) return;

    const request: google.maps.DirectionsRequest = {
      origin: this.origin,
      destination: this.destination,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsService.route(request).subscribe({
      next: (response) => {
        if (response.status === 'OK' && response.result) {
          this.directionsResults = response.result;

          // Extrair distância e duração
          const leg = response.result.routes[0]?.legs[0];
          if (leg) {
            this.distanceText = leg.distance?.text || '';
            this.durationText = leg.duration?.text || '';
          }

          // Ajustar zoom para mostrar toda a rota
          if (this.googleMap?.googleMap) {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(this.origin!);
            bounds.extend(this.destination!);
            this.googleMap.googleMap.fitBounds(bounds, 50);
          }
        }
      },
      error: (err) => {
        console.error('Erro ao calcular rota:', err);
      }
    });
  }

  // Método público para obter distância
  getDistance(): string {
    return this.distanceText;
  }

  // Método público para obter duração
  getDuration(): string {
    return this.durationText;
  }
}

