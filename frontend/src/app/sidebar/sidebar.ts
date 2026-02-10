import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private authService = inject(AuthService);
  
  isExpanded = signal(false);
  activePage = signal('reports');

  // Images
  SidebarLeft = "assets/icons/sidebar-left.svg";
  ChartSquare = "assets/icons/chart-square.svg";
  Personalcard = "assets/icons/personalcard.svg";
  User = "assets/icons/user.svg";
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
    }
  }
}
