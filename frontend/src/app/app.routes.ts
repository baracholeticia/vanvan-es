import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MainLayout } from './layout/main-layout';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { 
    path: '', 
    component: MainLayout,
    canActivate: [authGuard], 
    children: [
    ] 
  },
  // Temporary workaround: Since we don't have a dashboard component, let's make the root path protected 
  // but if the user is logged in, they stay on root. If not, guard sends to login.
];
