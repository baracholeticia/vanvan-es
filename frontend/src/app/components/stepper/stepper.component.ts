import { Component, Input, ContentChildren, QueryList, Output, EventEmitter, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, query, group } from '@angular/animations';
import { StepComponent } from './step.component';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  animations: [
    trigger('stepAnimation', [
      transition('* => *', [
        query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 }), { optional: true }),
        group([
          query(':leave', [
            animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX({{leaveLeft}})', opacity: 0 }))
          ], { optional: true, params: { leaveLeft: '-50%' } }),
          query(':enter', [
            style({ transform: 'translateX({{enterLeft}})', opacity: 0 }),
            animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
          ], { optional: true, params: { enterLeft: '100%' } })
        ])
      ])
    ]),
    trigger('indicatorAnimation', [
      state('inactive', style({ transform: 'scale(1)', backgroundColor: '#222', color: '#a3a3a3' })),
      state('active', style({ transform: 'scale(1.1)', backgroundColor: '#557D96', color: '#fff' })),
      state('complete', style({ transform: 'scale(1)', backgroundColor: '#557D96', color: '#3b82f6' })),
      transition('* <=> *', animate('300ms ease-in-out'))
    ]),
    trigger('lineAnimation', [
      state('incomplete', style({ width: '0%', backgroundColor: 'transparent' })),
      state('complete', style({ width: '100%', backgroundColor: '#557D96' })),
      transition('incomplete <=> complete', animate('400ms ease-out'))
    ])
  ]
})
export class StepperComponent implements AfterContentInit {
  @Input() initialStep = 1;
  @Input() disableStepIndicators = false;

  @Output() stepChange = new EventEmitter<number>();
  @Output() finalStepCompleted = new EventEmitter<void>();

  @ContentChildren(StepComponent) steps!: QueryList<StepComponent>;

  currentStep = 1;
  direction = 1; // 1 for forward, -1 for backward
  totalSteps = 0;
  isCompleted = false;

  ngAfterContentInit() {
    this.totalSteps = this.steps.length;
    this.currentStep = this.initialStep;
    this.updateVisibleSteps();
  }

  get isLastStep(): boolean {
    return this.currentStep === this.totalSteps;
  }

  get enteringTransform(): string {
    return this.direction >= 0 ? '100%' : '-100%';
  }

  get leavingTransform(): string {
    return this.direction >= 0 ? '-100%' : '100%';
  }

  updateStep(newStep: number) {
    this.currentStep = newStep;
    this.updateVisibleSteps();

    if (newStep > this.totalSteps) {
      this.isCompleted = true;
      this.finalStepCompleted.emit();
    } else {
      this.stepChange.emit(newStep);
    }
  }

  handleBack() {
    if (this.currentStep > 1) {
      this.direction = -1;
      this.updateStep(this.currentStep - 1);
    }
  }

  handleNext() {
    if (!this.isLastStep) {
      this.direction = 1;
      this.updateStep(this.currentStep + 1);
    } else {
      this.handleComplete();
    }
  }

  handleComplete() {
    this.direction = 1;
    this.updateStep(this.totalSteps + 1);
  }

  goToStep(stepNumber: number) {
    if (!this.disableStepIndicators && stepNumber !== this.currentStep) {
      this.direction = stepNumber > this.currentStep ? 1 : -1;
      this.updateStep(stepNumber);
    }
  }

  getStatus(stepNumber: number): 'inactive' | 'active' | 'complete' {
    if (this.currentStep === stepNumber) return 'active';
    if (this.currentStep > stepNumber) return 'complete';
    return 'inactive';
  }

  private updateVisibleSteps() {
    if (this.steps) {
      this.steps.forEach((step, index) => {
        step.active = (index + 1) === this.currentStep;
      });
    }
  }
}
