import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { provideEmployeApi } from './infrastructure/providers/provide-employe-api';

/**
 * COMPOSITION ROOT — seul endroit où les couches sont assemblées.
 * Application 100 % standalone : aucun NgModule.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      // Le paramètre `:id` de /edit/:id arrive directement dans l'input `id` du composant.
      withComponentInputBinding(),
      // Fondu enchaîné entre les pages (View Transitions API, ignorée si non supportée).
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),

    provideHttpClient(withFetch()),

    // Injection de dépendances : le port EmployeRepository du core est relié
    // à son adaptateur HTTP. Changer de source de données = changer cette ligne.
    provideEmployeApi(environment.apiBaseUrl),
  ],
};
