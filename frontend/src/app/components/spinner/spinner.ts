import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [style.gap]="gap">
      <div
        class="spinner"
        [style.width]="size"
        [style.height]="size"
        [style.border-width]="borderWidth"
        [style.border-color]="'transparent'"
        [style.border-top-color]="color">
      </div>
      <span *ngIf="text" class="text-body" [style.color]="textColor">{{ text }}</span>
    </div>
  `,
  styles: [`
    .spinner {
      border-style: solid;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class Spinner {
  @Input() size: string = '24px';
  @Input() borderWidth: string = '3px';
  @Input() color: string = '#1E88E5';
  @Input() text: string = '';
  @Input() textColor: string = '#646464';
  @Input() gap: string = '12px';
}

