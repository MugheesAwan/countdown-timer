import { ChangeDetectionStrategy, Component, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { timer, switchMap, map, catchError, of, startWith, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

  // Observable for the countdown state
  countdownState$ = this.createCountdownState();

  constructor() {
    // Subscribe to the observable to trigger the API call
    this.countdownState$.subscribe();
  }

  /**
   * Creates the main countdown state observable using RxJS operators
   * Combines API data with a timer for real-time updates
   */
  private createCountdownState() {
    // Start with loading state
    const initialState: CountdownState = {
      secondsLeft: null,
    };

    // Fetch initial deadline data
    const deadlineData$ = this.deadlineService.getDeadline().pipe(
      catchError((error) => {
        // Set error signal with error message
        this.error.set(error.message || 'An error occurred while fetching deadline');
        // Return an error state instead of fallback data
        throw error;
      }),
      finalize(() => {
        // Set loading to false when request completes (success or error)
        this.loading.set(false);
      })
    );

    // Process the deadline data and create countdown
    return deadlineData$.pipe(
      switchMap((deadlineData) => {
        // Create countdown that decrements every second
        const initialSeconds = deadlineData.secondsLeft!;

        return timer(0, 1000).pipe(
          takeUntilDestroyed(this.destroyRef),
          map((tick: number) => {
            const secondsLeft = Math.max(0, initialSeconds - tick);

            return {
              secondsLeft,
            };
          })
        );
      }),
      startWith(initialState),
      takeUntilDestroyed(this.destroyRef)
    );
  }
}
