import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EmailDejaUtiliseError } from '../../../../core/models/employe.errors';
import { Employe } from '../../../../core/models/employe.model';
import { EmployeService } from '../../../../core/services/employe.service';
import { EmployeForm } from './employe-form';

describe('EmployeForm', () => {
  const existant: Employe = {
    id: '4',
    name: 'Fatou Sow',
    email: 'fatou.sow@entreprise.sn',
    image: '',
    fonction: 'Développeuse full-stack',
    role: 'Lead',
  };

  const service = {
    getEmployeById: vi.fn(() => of(existant)),
    addEmploye: vi.fn(() => of(existant)),
    updateEmploye: vi.fn(() => of(existant)),
  };

  let fixture: ComponentFixture<EmployeForm>;
  let racine: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  /** Saisit une valeur dans un champ comme le ferait un utilisateur. */
  function saisir(id: string, valeur: string): void {
    const champ = racine.querySelector<HTMLInputElement>(`#${id}`)!;
    champ.value = valeur;
    champ.dispatchEvent(new Event('input'));
  }

  /** Bouton radio d'un rôle, retrouvé par son libellé visible. */
  function radioRole(role: string): HTMLInputElement {
    const libelle = Array.from(racine.querySelectorAll('label.role')).find((l) => l.textContent?.trim() === role);
    return libelle!.querySelector('input')!;
  }

  function choisirRole(role: string): void {
    radioRole(role).click();
  }

  async function soumettre(): Promise<void> {
    racine.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  async function creer(id?: string): Promise<void> {
    fixture = TestBed.createComponent(EmployeForm);
    if (id !== undefined) {
      fixture.componentRef.setInput('id', id);
    }
    racine = fixture.nativeElement;
    await fixture.whenStable();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [EmployeForm],
      providers: [provideRouter([]), { provide: EmployeService, useValue: service }],
    });
    // Évite une vraie navigation (aucune route n'est déclarée dans ce test).
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it("n'envoie rien et affiche les erreurs si le formulaire est vide", async () => {
    await creer();
    await soumettre();

    expect(service.addEmploye).not.toHaveBeenCalled();
    expect(racine.textContent).toContain('Le nom est obligatoire.');
    expect(racine.textContent).toContain("L'e-mail est obligatoire.");
    expect(racine.textContent).toContain('Choisissez un rôle.');
  });

  it('signale un e-mail invalide', async () => {
    await creer();
    saisir('email', 'pas-un-email');
    await fixture.whenStable();

    expect(racine.textContent).toContain('Saisissez une adresse e-mail valide.');
  });

  it('ajoute un employé quand le formulaire est valide, puis revient à la liste', async () => {
    await creer();
    saisir('name', 'Ousmane Sarr');
    saisir('email', 'ousmane.sarr@entreprise.sn');
    saisir('fonction', 'Data analyst');
    choisirRole('Junior');
    await soumettre();

    expect(service.addEmploye).toHaveBeenCalledWith({
      name: 'Ousmane Sarr',
      email: 'ousmane.sarr@entreprise.sn',
      fonction: 'Data analyst',
      role: 'Junior',
      image: '',
    });
    expect(navigate).toHaveBeenCalledWith(['/employes']);
  });

  it("pré-remplit puis met à jour l'employé en mode modification", async () => {
    await creer('4');

    expect(service.getEmployeById).toHaveBeenCalledWith('4');
    expect(racine.querySelector<HTMLInputElement>('#name')!.value).toBe('Fatou Sow');
    expect(radioRole('Lead').checked).toBe(true);

    choisirRole('Manager');
    await soumettre();

    expect(service.updateEmploye).toHaveBeenCalledWith('4', expect.objectContaining({ role: 'Manager' }));
    expect(navigate).toHaveBeenCalledWith(['/employes']);
  });

  it("affiche sous le champ l'erreur d'e-mail déjà utilisé renvoyée par le service", async () => {
    service.addEmploye.mockReturnValueOnce(throwError(() => new EmailDejaUtiliseError('fatou.sow@entreprise.sn')));
    await creer();
    saisir('name', 'Fatou Sow');
    saisir('email', 'fatou.sow@entreprise.sn');
    saisir('fonction', 'Développeuse');
    choisirRole('Lead');
    await soumettre();

    expect(racine.textContent).toContain('Cette adresse est déjà attribuée à un autre employé.');
    expect(navigate).not.toHaveBeenCalled();
  });
});
