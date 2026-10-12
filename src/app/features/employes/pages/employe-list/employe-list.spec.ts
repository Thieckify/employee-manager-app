import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Employe } from '../../../../core/models/employe.model';
import { EmployeRepository } from '../../../../core/repositories/employe.repository';
import { EmployeList } from './employe-list';

/** Test d'intégration : vraie page + vrai EmployeService, seul le dépôt est simulé. */
describe('EmployeList', () => {
  const equipe: Employe[] = [
    { id: '1', name: 'Aminata Diop', email: 'aminata.diop@entreprise.sn', image: '', fonction: 'DRH', role: 'Direction' },
    { id: '2', name: 'Ndèye Fatou Faye', email: 'ndeye.faye@entreprise.sn', image: '', fonction: 'Comptable', role: 'Manager' },
    { id: '3', name: 'Awa Ba', email: 'awa.ba@entreprise.sn', image: '', fonction: 'Designer UI/UX', role: 'Senior' },
  ];

  async function afficher() {
    TestBed.configureTestingModule({
      imports: [EmployeList],
      providers: [provideRouter([]), { provide: EmployeRepository, useValue: { getAll: () => of(equipe) } }],
    });
    const fixture = TestBed.createComponent(EmployeList);
    await fixture.whenStable();
    return { fixture, racine: fixture.nativeElement as HTMLElement };
  }

  const noms = (racine: HTMLElement) =>
    Array.from(racine.querySelectorAll('.carte__nom')).map((n) => n.textContent?.trim());

  it("affiche l'équipe triée par niveau hiérarchique et ses indicateurs", async () => {
    const { racine } = await afficher();

    expect(noms(racine)).toEqual(['Aminata Diop', 'Ndèye Fatou Faye', 'Awa Ba']);
    expect(racine.querySelector('.tuile__valeur')?.textContent).toBe('3');
  });

  it('filtre les cartes pendant la saisie de la recherche', async () => {
    const { fixture, racine } = await afficher();

    const recherche = racine.querySelector<HTMLInputElement>('input[type="search"]')!;
    recherche.value = 'ndeye';
    recherche.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(noms(racine)).toEqual(['Ndèye Fatou Faye']);
    expect(racine.querySelector('.resume')?.textContent).toContain('1 collaborateur');
  });
});
