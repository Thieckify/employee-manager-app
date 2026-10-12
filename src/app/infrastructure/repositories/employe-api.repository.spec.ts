import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EmployeIntrouvableError, ServeurIndisponibleError } from '../../core/models/employe.errors';
import { Employe, EmployeInput } from '../../core/models/employe.model';
import { EmployeApiRepository } from './employe-api.repository';
import { provideEmployeApi } from '../providers/provide-employe-api';

describe('EmployeApiRepository', () => {
  const url = 'http://api.test/employes';
  const saisie: EmployeInput = {
    name: 'Cheikh Tidiane Fall',
    email: 'cheikh.fall@entreprise.sn',
    image: '',
    fonction: 'Ingénieur DevOps',
    role: 'Senior',
  };

  let repository: EmployeApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideEmployeApi('http://api.test'), EmployeApiRepository],
    });
    repository = TestBed.inject(EmployeApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GET /employes et convertit les DTO', () => {
    let resultat: Employe[] = [];
    repository.getAll().subscribe((liste) => (resultat = liste));

    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1', name: 'Awa Ba', image: '', fonction: 'Designer', role: 'Senior', createdAt: '1' }]);

    expect(resultat).toEqual([
      { id: '1', name: 'Awa Ba', email: '', image: '', fonction: 'Designer', role: 'Senior', createdAt: '1' },
    ]);
  });

  it('considère un 404 sur la collection comme une liste vide', () => {
    let resultat: Employe[] | undefined;
    repository.getAll().subscribe((liste) => (resultat = liste));

    http.expectOne(url).flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(resultat).toEqual([]);
  });

  it('traduit un 404 sur un employé en EmployeIntrouvableError', () => {
    let erreur: unknown;
    repository.getById('99').subscribe({ error: (e) => (erreur = e) });

    http.expectOne(`${url}/99`).flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(erreur).toBeInstanceOf(EmployeIntrouvableError);
  });

  it('traduit une coupure réseau en ServeurIndisponibleError', () => {
    let erreur: unknown;
    repository.getAll().subscribe({ error: (e) => (erreur = e) });

    http.expectOne(url).error(new ProgressEvent('error'));

    expect(erreur).toBeInstanceOf(ServeurIndisponibleError);
  });

  it('POST /employes avec tous les champs saisis', () => {
    repository.create(saisie).subscribe();

    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(saisie);
    req.flush({ id: '9', ...saisie, createdAt: '1' });
  });

  it('PUT /employes/:id avec tous les champs saisis', () => {
    repository.update('3', saisie).subscribe();

    const req = http.expectOne(`${url}/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(saisie);
    req.flush({ id: '3', ...saisie, createdAt: '1' });
  });

  it('DELETE /employes/:id', () => {
    let termine = false;
    repository.delete('3').subscribe(() => (termine = true));

    const req = http.expectOne(`${url}/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: '3', ...saisie, createdAt: '1' });

    expect(termine).toBe(true);
  });
});
