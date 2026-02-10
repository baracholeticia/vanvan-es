import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onLogin(): void {
    if (!this.email || !this.password) return;
    
    this.isLoading.set(true);
    
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/']); // Redirect to home/dashboard
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
