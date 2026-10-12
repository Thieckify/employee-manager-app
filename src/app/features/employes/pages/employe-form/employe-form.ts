import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { EmailDejaUtiliseError, messageErreur } from '../../../../core/models/employe.errors';
import { EMPLOYE_ROLES, EmployeInput, FONCTIONS_SUGGEREES } from '../../../../core/models/employe.model';
import { EmployeService } from '../../../../core/services/employe.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { Icon } from '../../../../shared/ui/icon/icon';
import { RoleBadge } from '../../components/role-badge/role-badge';

/** Noms des champs du formulaire (identiques aux champs d'`EmployeInput`). */
type Champ = keyof EmployeInput;

/** URL d'image acceptée : http(s) sans espace. */
const FORMAT_URL = /^https?:\/\/\S+$/;

/**
 * Page formulaire, partagée par deux routes :
 *  - /add       → création (POST)
 *  - /edit/:id  → formulaire pré-rempli, puis mise à jour (PUT)
 *
 * Le composant gère la saisie (Reactive Forms) et l'affichage des erreurs.
 * Le nettoyage, les règles métier et l'enregistrement sont délégués à `EmployeService`.
 */
@Component({
  selector: 'app-employe-form',
  imports: [ReactiveFormsModule, RouterLink, Avatar, Icon, RoleBadge],
  templateUrl: './employe-form.html',
  styleUrl: './employe-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeForm implements OnInit {
  /** Paramètre de route `:id`, injecté grâce à `withComponentInputBinding()`. */
  readonly id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly employeService = inject(EmployeService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hote = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly roles = EMPLOYE_ROLES;
  protected readonly fonctionsSuggerees = FONCTIONS_SUGGEREES;

  /** `true` en modification, `false` en création. */
  protected readonly modeEdition = computed(() => this.id() !== undefined);
  protected readonly chargement = signal(false);
  protected readonly enregistrement = signal(false);
  protected readonly erreurChargement = signal<string | null>(null);
  protected readonly erreurEnregistrement = signal<string | null>(null);

  /**
   * Formulaire réactif et validations de saisie :
   *  - nom (2 à 60 caractères), e-mail valide, fonction et rôle obligatoires ;
   *  - photo facultative, mais au format URL http(s) si renseignée.
   */
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    fonction: ['', [Validators.required, Validators.maxLength(60)]],
    role: ['', [Validators.required]],
    image: ['', [Validators.pattern(FORMAT_URL)]],
  });

  /** Valeurs du formulaire en temps réel, pour l'aperçu de la fiche. */
  protected readonly apercu = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  /** Photo affichée dans l'aperçu, seulement quand l'URL est complète. */
  protected readonly imageApercu = computed(() => {
    const url = this.apercu().image.trim();
    return FORMAT_URL.test(url) ? url : '';
  });

  /** En modification, charge l'employé (GET) et pré-remplit le formulaire. */
  ngOnInit(): void {
    const id = this.id();
    if (id === undefined) {
      return;
    }

    this.chargement.set(true);
    this.employeService
      .getEmployeById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (employe) => {
          this.form.setValue({
            name: employe.name,
            email: employe.email,
            fonction: employe.fonction,
            role: employe.role,
            image: employe.image,
          });
          this.chargement.set(false);
        },
        error: (erreur: unknown) => {
          this.erreurChargement.set(messageErreur(erreur));
          this.chargement.set(false);
        },
      });
  }

  /** Un champ affiche son erreur seulement une fois touché ou modifié. */
  protected invalide(champ: Champ): boolean {
    const controle = this.form.controls[champ];
    return controle.invalid && (controle.touched || controle.dirty);
  }

  /** Valide puis enregistre via le service : POST (ajout) ou PUT (modification). */
  protected enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focaliserPremierChampInvalide();
      return;
    }

    const id = this.id();
    const saisie = this.form.getRawValue();
    const requete$ =
      id === undefined
        ? this.employeService.addEmploye(saisie)
        : this.employeService.updateEmploye(id, saisie);

    this.enregistrement.set(true);
    this.erreurEnregistrement.set(null);

    requete$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (employe) => {
        this.notifications.succes(
          id === undefined ? 'Employé ajouté' : 'Modifications enregistrées',
          `La fiche de ${employe.name} est à jour.`,
        );
        this.router.navigate(['/employes']);
      },
      error: (erreur: unknown) => {
        this.enregistrement.set(false);

        // Règle métier violée sur un champ précis : l'erreur s'affiche sous le champ.
        if (erreur instanceof EmailDejaUtiliseError) {
          const email = this.form.controls.email;
          email.setErrors({ dejaUtilise: true });
          email.markAsTouched();
          this.hote.nativeElement.querySelector<HTMLInputElement>('#email')?.focus();
          return;
        }
        this.erreurEnregistrement.set(messageErreur(erreur));
      },
    });
  }

  /** Place le curseur sur le premier champ en erreur (accessibilité clavier). */
  private focaliserPremierChampInvalide(): void {
    this.hote.nativeElement.querySelector<HTMLElement>('input.ng-invalid')?.focus();
  }
}
