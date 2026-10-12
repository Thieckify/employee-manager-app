import { Routes } from '@angular/router';

/**
 * Routes de la fonctionnalité « Employés » (chemins imposés par l'énoncé).
 * Chaque page est chargée à la demande.
 */
export const EMPLOYES_ROUTES: Routes = [
  {
    path: 'employes',
    title: 'Équipe · Employee Manager',
    loadComponent: () => import('./pages/employe-list/employe-list').then((m) => m.EmployeList),
  },
  {
    path: 'add',
    title: 'Nouvel employé · Employee Manager',
    loadComponent: () => import('./pages/employe-form/employe-form').then((m) => m.EmployeForm),
  },
  {
    path: 'edit/:id',
    title: 'Modifier un employé · Employee Manager',
    loadComponent: () => import('./pages/employe-form/employe-form').then((m) => m.EmployeForm),
  },
];
