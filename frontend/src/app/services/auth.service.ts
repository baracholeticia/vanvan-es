import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  
  // Mock user for testing without backend
  currentUser = signal<{email: string} | null>(null);

  constructor(private router: Router) {
    // Check if token exists on startup
    if (this.getToken()) {
      // In a real app we'd decode the token or fetch user details here
      this.currentUser.set({ email: 'user@example.com' });
    }
  }

  // Simulates a backend call
  login(email: string, pass: string): Observable<{token: string}> {
    // MOCK: Generate a fake token
    const mockResponse = {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token'
    };
    
    return of(mockResponse).pipe(
      delay(1000), // Simulate network latency
      tap(response => {
        this.setToken(response.token);
        this.currentUser.set({ email });
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  setToken(token: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
