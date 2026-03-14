import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Public pages can be prerendered
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  { path: 'register-driver', renderMode: RenderMode.Prerender },
  { path: 'home', renderMode: RenderMode.Prerender },
  { path: 'buttons', renderMode: RenderMode.Prerender },

  // Authenticated pages must render on the client only
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: 'viagens', renderMode: RenderMode.Client },
  { path: 'viagem/**', renderMode: RenderMode.Client },
  { path: 'motorista', renderMode: RenderMode.Client },
  { path: 'driver-status', renderMode: RenderMode.Client },

  // Fallback
  { path: '**', renderMode: RenderMode.Prerender }
];
