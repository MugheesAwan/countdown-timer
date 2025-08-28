import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CountdownTimerComponent } from './components/countdown-timer/countdown-timer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CountdownTimerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('countdown-timer');
}
