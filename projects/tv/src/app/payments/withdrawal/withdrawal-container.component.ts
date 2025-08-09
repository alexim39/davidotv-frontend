import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { Observable } from 'rxjs';
import { WithdrawalComponent } from './withdrawal.component';
import { UserInterface, UserService } from '../../common/services/user.service';

@Component({
  selector: 'async-withdraw-container',
  standalone: true,
  imports: [CommonModule, WithdrawalComponent],
  template: `
    <async-withdrawal 
      *ngIf="user$ | async as user" 
      [user]="user"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawalContainerComponent{
  private readonly userService = inject(UserService);
  
  // Recommended approach using async pipe
  readonly user$: Observable<UserInterface | null> = this.userService.getCurrentUser$;

}