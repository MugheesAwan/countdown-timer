import {
  ChangeDetectionStrategy,
  Component,
  inject,
  DestroyRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { timer, switchMap, map, catchError, of, startWith, finalize, Observable } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DeadlineService } from '../../services/deadline.service';

export interface CountdownState {
  secondsLeft: number | null;
}

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent {
  private readonly deadlineService = inject(DeadlineService);
  private readonly destroyRef = inject(DestroyRef);

  // Signals for error and loading states
  readonly error = signal<string | null>(null);
  readonly loading = signal<boolean>(true);

  // Signal for the countdown state
  readonly countdownState = toSignal(this.createCountdownState(), {
    initialValue: { secondsLeft: null } as CountdownState,
  });

  // Computed signal for the seconds left
  readonly secondsLeft = computed(() => this.countdownState()?.secondsLeft ?? null);

  // Creates the main countdown state observable using RxJS operators
  // Combines API data with a timer for real-time updates
  private createCountdownState(): Observable<CountdownState> {
    // Fetch initial deadline data
    const deadlineData$ = this.deadlineService.getDeadline().pipe(
      catchError((error) => {
        this.error.set(error.message || 'An error occurred while fetching deadline');
        throw error;
      }),
      finalize(() => {
        this.loading.set(false);
      })
    );

    // Process the deadline data and create countdown
    return deadlineData$.pipe(
      switchMap((deadlineData) => {
        // Create countdown that decrements every second
        const initialSeconds = deadlineData.secondsLeft!;

        return timer(0, 1000).pipe(
          map((tick: number) => {
            const secondsLeft = Math.max(0, initialSeconds - tick);

            return {
              secondsLeft,
            };
          }),
          takeUntilDestroyed(this.destroyRef)
        );
      })
    );
  }
}
