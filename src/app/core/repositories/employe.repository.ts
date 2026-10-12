import { Observable } from 'rxjs';

import { Employe, EmployeInput } from '../models/employe.model';

/**
 * CORE — Port d'accès aux données des employés.
 *
 * `EmployeService` dépend de CETTE abstraction, jamais de HttpClient
 * (inversion de dépendance). C'est une classe abstraite et non une interface
 * car elle doit exister à l'exécution pour servir de jeton d'injection.
 *
 * Implémentation : `infrastructure/api/employe-api.repository.ts`,
 * branchée dans `app.config.ts` via `provideEmployeApi()`.
 *
 * Contrat d'erreur : les implémentations émettent uniquement des
 * `EmployeError` (voir `employe.errors.ts`), jamais d'erreurs techniques.
 */
export abstract class EmployeRepository {
  /** Récupère tous les employés. */
  abstract getAll(): Observable<Employe[]>;

  /** Récupère un employé par son identifiant. */
  abstract getById(id: string): Observable<Employe>;

  /** Crée un employé et renvoie l'employé créé (avec son `id`). */
  abstract create(data: EmployeInput): Observable<Employe>;

  /** Remplace les données d'un employé et renvoie sa nouvelle version. */
  abstract update(id: string, data: EmployeInput): Observable<Employe>;

  /** Supprime un employé. */
  abstract delete(id: string): Observable<void>;
}
