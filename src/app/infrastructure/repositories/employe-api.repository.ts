import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import {
  EmployeError,
  EmployeIntrouvableError,
  ServeurIndisponibleError,
} from '../../core/models/employe.errors';
import { Employe, EmployeInput } from '../../core/models/employe.model';
import { EmployeRepository } from '../../core/repositories/employe.repository';
import { API_BASE_URL } from '../config/api-base-url.token';
import { EmployeResponseDto } from '../dto/employe-response.dto';
import { toCreateEmployeDto, toEmploye, toUpdateEmployeDto } from '../mappers/employe.mapper';

/**
 * INFRASTRUCTURE — Adaptateur HTTP du port `EmployeRepository`.
 *
 * C'est le SEUL endroit de l'application qui connaît HttpClient, l'URL de
 * l'API et les DTO. Il traduit aussi les erreurs HTTP en erreurs métier,
 * pour que le core n'ait jamais à manipuler de code HTTP.
 */
@Injectable()
export class EmployeApiRepository implements EmployeRepository {
  private readonly http = inject(HttpClient);

  /** URL de la ressource : `<base>/employes`. */
  private readonly url = `${inject(API_BASE_URL)}/employes`;

  /** GET /employes */
  getAll(): Observable<Employe[]> {
    return this.http.get<EmployeResponseDto[]>(this.url).pipe(
      map((dtos) => dtos.map(toEmploye)),
      // MockAPI répond 404 quand la collection est vide : ce n'est pas une erreur.
      catchError((erreur: unknown) =>
        erreur instanceof HttpErrorResponse && erreur.status === 404 ? of([]) : traduireErreur(erreur),
      ),
    );
  }

  /** GET /employes/:id */
  getById(id: string): Observable<Employe> {
    return this.http
      .get<EmployeResponseDto>(`${this.url}/${id}`)
      .pipe(map(toEmploye), catchError(traduireErreur));
  }

  /** POST /employes */
  create(data: EmployeInput): Observable<Employe> {
    return this.http
      .post<EmployeResponseDto>(this.url, toCreateEmployeDto(data))
      .pipe(map(toEmploye), catchError(traduireErreur));
  }

  /** PUT /employes/:id */
  update(id: string, data: EmployeInput): Observable<Employe> {
    return this.http
      .put<EmployeResponseDto>(`${this.url}/${id}`, toUpdateEmployeDto(data))
      .pipe(map(toEmploye), catchError(traduireErreur));
  }

  /** DELETE /employes/:id (le corps de la réponse est ignoré). */
  delete(id: string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`).pipe(
      map(() => undefined),
      catchError(traduireErreur),
    );
  }
}

/** Traduit une erreur HTTP en erreur métier compréhensible par le core. */
function traduireErreur(erreur: unknown): Observable<never> {
  if (erreur instanceof HttpErrorResponse) {
    if (erreur.status === 404) {
      return throwError(() => new EmployeIntrouvableError());
    }
    if (erreur.status === 0 || erreur.status >= 500) {
      return throwError(() => new ServeurIndisponibleError());
    }
    return throwError(() => new EmployeError(`Le serveur a refusé la requête (code ${erreur.status}).`));
  }
  return throwError(() => erreur);
}
