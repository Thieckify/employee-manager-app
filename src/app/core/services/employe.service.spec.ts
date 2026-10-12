import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { EmailDejaUtiliseError, EmployeIntrouvableError, EmployeInvalideError } from '../models/employe.errors';
import { Employe, EmployeInput } from '../models/employe.model';
import { EmployeRepository } from '../repositories/employe.repository';
import { EmployeService } from './employe.service';

/** Faux dépôt en mémoire : le service est testé sans aucun appel HTTP. */
class FauxRepository implements EmployeRepository {
  donnees: Employe[] = [];

  getAll(): Observable<Employe[]> {
    return of(this.donnees.map((e) => ({ ...e })));
  }

  getById(id: string): Observable<Employe> {
    const employe = this.donnees.find((e) => e.id === id);
    return employe ? of({ ...employe }) : throwError(() => new EmployeIntrouvableError());
  }

  create = vi.fn((data: EmployeInput): Observable<Employe> => {
    const cree = { id: `n${this.donnees.length + 1}`, ...data };
    this.donnees.push(cree);
    return of({ ...cree });
  });

  update = vi.fn((id: string, data: EmployeInput): Observable<Employe> => {
    const modifie = { id, ...data };
    this.donnees = this.donnees.map((e) => (e.id === id ? modifie : e));
    return of({ ...modifie });
  });

  delete(id: string): Observable<void> {
    this.donnees = this.donnees.filter((e) => e.id !== id);
    return of(undefined);
  }
}

/** Souscrit à un Observable synchrone et renvoie sa valeur ou son erreur. */
function executer<T>(source$: Observable<T>): { valeur?: T; erreur?: unknown } {
  const resultat: { valeur?: T; erreur?: unknown } = {};
  source$.subscribe({ next: (v) => (resultat.valeur = v), error: (e) => (resultat.erreur = e) });
  return resultat;
}

function employe(partiel: Partial<Employe> & Pick<Employe, 'id' | 'name'>): Employe {
  return { email: '', image: '', fonction: 'Développeur', role: 'Senior', ...partiel };
}

describe('EmployeService', () => {
  let service: EmployeService;
  let repository: FauxRepository;

  const saisie: EmployeInput = {
    name: '  Ousmane   Sarr ',
    email: ' Ousmane.Sarr@Entreprise.sn ',
    fonction: 'Data analyst',
    role: 'Junior',
    image: '',
  };

  beforeEach(() => {
    repository = new FauxRepository();
    repository.donnees = [
      employe({ id: '1', name: 'Fatou Sow', email: 'fatou.sow@entreprise.sn', role: 'Lead' }),
      employe({ id: '2', name: 'Aminata Diop', email: 'aminata.diop@entreprise.sn', role: 'Direction', fonction: 'DRH' }),
      employe({ id: '3', name: 'Ndèye Fatou Faye', email: 'ndeye.faye@entreprise.sn', role: 'Manager', fonction: 'Comptable' }),
      employe({
        id: '4',
        name: 'Fiche générée',
        fonction: 'Invalid faker method - random.word',
        role: 'Invalid faker method - random.word',
      }),
    ];

    TestBed.configureTestingModule({
      providers: [{ provide: EmployeRepository, useValue: repository }],
    });
    service = TestBed.inject(EmployeService);
  });

  it('nettoie les valeurs générées invalides et trie par niveau hiérarchique puis par nom', () => {
    executer(service.getEmployes());

    expect(service.estCharge()).toBe(true);
    expect(service.employes().map((e) => e.name)).toEqual([
      'Aminata Diop',
      'Ndèye Fatou Faye',
      'Fatou Sow',
      'Fiche générée',
    ]);
    expect(service.employes()[3]).toMatchObject({ fonction: '', role: '' });
  });

  it("calcule les statistiques de l'équipe", () => {
    executer(service.getEmployes());

    const stats = service.statistiques();
    expect(stats.effectif).toBe(4);
    expect(stats.encadrement).toBe(3);
    expect(stats.tauxEncadrement).toBe(75);
    expect(stats.fonctions).toBe(3);
    expect(stats.parRole.find((r) => r.role === 'Manager')).toEqual({ role: 'Manager', effectif: 1, part: 25 });
  });

  it('recherche sans tenir compte des accents ni de la casse, et filtre par rôle', () => {
    executer(service.getEmployes());

    expect(service.filtrer({ recherche: 'NDEYE', role: null }).map((e) => e.id)).toEqual(['3']);
    expect(service.filtrer({ recherche: 'fatou', role: null })).toHaveLength(2);
    expect(service.filtrer({ recherche: 'fatou', role: 'Lead' }).map((e) => e.id)).toEqual(['1']);
  });

  it('ajoute un employé nettoyé, avec un avatar généré, et met à jour l’annuaire', () => {
    const { valeur } = executer(service.addEmploye(saisie));

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ousmane Sarr', email: 'ousmane.sarr@entreprise.sn' }),
    );
    expect(valeur?.image).toContain('seed=Ousmane%20Sarr');
    expect(service.employes().some((e) => e.name === 'Ousmane Sarr')).toBe(true);
  });

  it('refuse un e-mail déjà utilisé par un autre employé', () => {
    const { erreur } = executer(service.addEmploye({ ...saisie, email: 'FATOU.SOW@entreprise.sn' }));

    expect(erreur).toBeInstanceOf(EmailDejaUtiliseError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('refuse un rôle hors catalogue', () => {
    const { erreur } = executer(service.addEmploye({ ...saisie, role: 'Agent secret' }));

    expect(erreur).toBeInstanceOf(EmployeInvalideError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('autorise un employé à conserver son propre e-mail lors d’une modification', () => {
    const { erreur } = executer(
      service.updateEmploye('1', { ...saisie, name: 'Fatou Sow', email: 'fatou.sow@entreprise.sn', role: 'Manager' }),
    );

    expect(erreur).toBeUndefined();
    expect(service.employes().find((e) => e.id === '1')?.role).toBe('Manager');
  });

  it("retire l'employé supprimé de l'annuaire", () => {
    executer(service.getEmployes());
    executer(service.deleteEmploye('2'));

    expect(service.employes().map((e) => e.id)).not.toContain('2');
    expect(service.statistiques().effectif).toBe(3);
  });
});
