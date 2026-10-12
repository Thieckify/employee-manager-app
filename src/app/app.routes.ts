import { Routes } from '@angular/router';

/**
 * Routes racines. Les routes métier (/employes, /add, /edit/:id) sont
 * déclarées par la fonctionnalité elle-même et chargées à la demande.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'employes' },
  {
    path: '',
    loadChildren: () => import('./features/employes/employes.routes').then((m) => m.EMPLOYES_ROUTES),
  },
  // Toute URL inconnue ramène à l'équipe.
  { path: '**', redirectTo: 'employes' },
];
