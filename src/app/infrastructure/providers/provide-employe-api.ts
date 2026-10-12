import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { EmployeRepository } from '../../core/repositories/employe.repository';
import { API_BASE_URL } from '../config/api-base-url.token';
import { EmployeApiRepository } from '../repositories/employe-api.repository';

/**
 * INFRASTRUCTURE — Branche l'adaptateur HTTP sur le port du core.
 *
 * Appelé une seule fois, dans `app.config.ts`. Pour changer de source de
 * données (mock, autre API…), il suffit de fournir une autre implémentation
 * d'`EmployeRepository` : ni le service ni les composants ne changent.
 */
export function provideEmployeApi(baseUrl: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_BASE_URL, useValue: baseUrl },
    { provide: EmployeRepository, useClass: EmployeApiRepository },
  ]);
}
