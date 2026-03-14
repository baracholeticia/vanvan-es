import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex flex-col px-4 sm:px-8" *ngIf="active">
      <ng-content></ng-content>
    </div>
  `
})
export class StepComponent {
  @Input() active = false;
}
