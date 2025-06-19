import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
selector: 'app-checkout-progress',
standalone: true,
imports: [CommonModule],
template: `
<div class="checkout-progress">
  <div class="steps">
    <div *ngFor="let step of steps" 
         class="step" 
         [class.active]="step.id === currentStep"
         [class.completed]="isStepCompleted(step.id)">
      <div class="step-number">{{ getStepIndex(step.id) + 1 }}</div>
      <div class="step-label">{{ step.label }}</div>
    </div>
    <div class="progress-bar">
      <div class="progress" [style.width.%]="getProgressPercentage()"></div>
    </div>
  </div>
</div>
`,
styles: [`
.checkout-progress {
  margin-bottom: 30px;
  
  .steps {
    display: flex;
    justify-content: space-between;
    position: relative;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    
    &-number {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #eee;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 8px;
      transition: all 0.3s ease;
    }
    
    &-label {
      font-size: 14px;
      color: #999;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    &.active {
      .step-number {
        background: #2196F3;
        color: white;
      }
      
      .step-label {
        color: #333;
        font-weight: 600;
      }
    }
    
    &.completed {
      .step-number {
        background: #4CAF50;
        color: white;
      }
      
      .step-label {
        color: #4CAF50;
      }
    }
  }
  
  .progress-bar {
    position: absolute;
    top: 15px;
    left: 0;
    right: 0;
    height: 2px;
    background: #eee;
    z-index: 0;
    
    .progress {
      height: 100%;
      background: #4CAF50;
      transition: width 0.3s ease;
    }
  }
}
    `]
})
export class CheckoutProgressComponent {
  @Input() currentStep: 'shipping' | 'payment' | 'review' = 'shipping';
  
  steps = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
    { id: 'review', label: 'Review' }
  ];

  isStepCompleted(stepId: string): boolean {
    const currentIndex = this.getStepIndex(this.currentStep);
    const stepIndex = this.getStepIndex(stepId);
    return stepIndex < currentIndex;
  }

  getStepIndex(stepId: string): number {
    return this.steps.findIndex(step => step.id === stepId);
  }

  getProgressPercentage(): number {
    const currentIndex = this.getStepIndex(this.currentStep);
    return (currentIndex / (this.steps.length - 1)) * 100;
  }
}