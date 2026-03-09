import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onLogin(): void {
    if (!this.email || !this.password) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        const user = this.authService.currentUser();
        if (res.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (res.role === 'driver' && user?.registrationStatus && user.registrationStatus !== 'APPROVED') {
          this.router.navigate(['/driver-status']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        let errorMsg = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
        if (err.error && typeof err.error === 'object' && err.error.message) {
          errorMsg = err.error.message;
        } else if (err.status === 401 || err.status === 403) {
          errorMsg = 'E-mail ou senha incorretos.';
        } else if (typeof err.error === 'string') {
          errorMsg = err.error;
        }
        this.errorMessage.set(errorMsg);
        this.toastService.error(errorMsg);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
