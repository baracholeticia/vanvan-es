import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton animate-pulse"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="rounded">
    </div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg,
        rgba(238,238,239,0.6) 25%,
        rgba(220,220,220,0.8) 50%,
        rgba(238,238,239,0.6) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class Skeleton {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() rounded: string = '8px';
}

