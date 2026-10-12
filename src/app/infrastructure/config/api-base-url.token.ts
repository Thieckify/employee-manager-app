import { InjectionToken } from '@angular/core';

/** INFRASTRUCTURE — URL de base de l'API REST, fournie par `provideEmployeApi()`. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
