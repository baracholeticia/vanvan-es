import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private authService = inject(AuthService);
  private router = inject(Router);

  isExpanded = signal(false);
  activePage = signal('reports');

  // Images
  SidebarLeft = "assets/icons/sidebar-left.svg";
  ChartSquare = "assets/icons/chart-square.svg";
  Personalcard = "assets/icons/personalcard.svg";
  User = "assets/icons/user-edit.svg";
  Verify = "assets/icons/verify.svg";
  Setting = "assets/icons/setting.svg";
  Logout = "assets/icons/logout.svg";
  SidebarRight = "assets/icons/sidebar-right.svg";

  toggleSidebar() {
    this.isExpanded.update(v => !v);
  }

  setActivePage(page: string) {
    this.activePage.set(page);
    if (page === 'logout') {
      this.authService.logout();
    } else if (page === 'reports') {
      this.router.navigate(['/admin/relatorios']);
    } else if (page === 'drivers') {
      this.router.navigate(['/admin/motoristas']);
    }else if (page === 'clients') {
      this.router.navigate(['/admin/clientes']);
    } else if (page === 'ratings') {
      this.router.navigate(['/admin/avaliacoes']);
    } else if (page === 'verification') {
      this.router.navigate(['/admin/aprovar-motoristas']);
    } else if (page === 'admin') {
      this.router.navigate(['/admin/settings']);
    }
  }
}
