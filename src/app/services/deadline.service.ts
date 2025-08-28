import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DeadlineResponse {
  secondsLeft: number;
}

export type DeadlineResult = DeadlineResponse;

@Injectable({
  providedIn: 'root',
})
export class DeadlineService {
  private readonly apiUrl = '/api/deadline';

  constructor(private http: HttpClient) {}

  /**
   * Fetches the deadline information from the API
   * @returns Observable with deadline data or error
   */
  getDeadline(): Observable<DeadlineResult> {
    // TODO: Uncomment and use real API when backend is available
    // return this.http.get<DeadlineResponse>(this.apiUrl);

    // Mock API for development/testing
    return this.getMockDeadline();
  }

  /**
   * Mock API method that simulates a real API response
   * Returns a deadline of 200 seconds for demonstration
   */
  private getMockDeadline(): Observable<DeadlineResponse> {
    // Simulate network delay and return mock data
    return of({ secondsLeft: Math.floor(Math.random() * 500) + 1 }).pipe(
      delay(500) // 500ms delay to simulate network request
    );
  }
}
