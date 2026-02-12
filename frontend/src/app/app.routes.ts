import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MainLayout } from './layout/main-layout';


export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'register-driver-1', loadComponent: () => import('./pages/register-driver/register-driver-1/register-driver-1').then(m => m.RegisterDriverOne) },
  { path: 'register-driver-2', loadComponent: () => import('./pages/register-driver/register-driver-2/register-driver-2').then(m => m.RegisterDriverTwo) },
  { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'buttons', loadComponent: () => import('./pages/button-showcase/button-showcase').then(m => m.ButtonShowcase) },
  { 
    path: '', 
    component: MainLayout,
    canActivate: [authGuard], 
    children: [
      { path: '', redirectTo: 'relatorios', pathMatch: 'full' },
      { path: 'relatorios', loadComponent: () => import('./pages/relatorios/relatorios').then(m => m.Relatorios) },
      { path: 'motoristas', loadComponent: () => import('./pages/motoristas/motoristas.component').then(m => m.MotoristasComponent)}
    ] 
  },
];