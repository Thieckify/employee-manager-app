import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { messageErreur } from '../../../../core/models/employe.errors';
import { Employe, EmployeRole } from '../../../../core/models/employe.model';
import { EmployeService } from '../../../../core/services/employe.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { Icon } from '../../../../shared/ui/icon/icon';
import { EmployeCard } from '../../components/employe-card/employe-card';
import { EmployeStats } from '../../components/employe-stats/employe-stats';
import { EmployeTable } from '../../components/employe-table/employe-table';

/** Mode d'affichage de l'annuaire. */
type Vue = 'grille' | 'liste';

/**
 * Page « Équipe » (route /employes) : indicateurs, recherche, filtres,
 * liste des employés et suppression.
 *
 * Ce composant ne gère QUE l'état de la vue (chargement, filtres, affichage,
 * confirmation). Données, recherche et statistiques viennent d'`EmployeService`.
 */
@Component({
  selector: 'app-employe-list',
  imports: [RouterLink, Icon, ConfirmDialog, EmployeCard, EmployeTable, EmployeStats],
  templateUrl: './employe-list.html',
  styleUrl: './employe-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeList implements OnInit {
  private readonly employeService = inject(EmployeService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Indicateurs de l'équipe (calculés par le service). */
  protected readonly statistiques = this.employeService.statistiques;
  /** Nombre total d'employés, avant filtres. */
  protected readonly total = computed(() => this.employeService.employes().length);

  // ── État de la vue ──
  /** Squelette affiché seulement au tout premier chargement ; ensuite on rafraîchit en arrière-plan. */
  protected readonly chargement = signal(!this.employeService.estCharge());
  protected readonly erreur = signal<string | null>(null);
  protected readonly recherche = signal('');
  protected readonly roleFiltre = signal<EmployeRole | null>(null);
  protected readonly vue = signal<Vue>('grille');
  /** Employé dont la suppression attend confirmation. */
  protected readonly aSupprimer = signal<Employe | null>(null);
  protected readonly suppressionEnCours = signal(false);

  /** Employés correspondant à la recherche et au filtre (règle de filtrage : EmployeService). */
  protected readonly resultats = computed(() =>
    this.employeService.filtrer({ recherche: this.recherche(), role: this.roleFiltre() }),
  );

  /** Rôles présents dans l'équipe, avec leur couleur, pour les filtres. */
  protected readonly rolesPresents = computed(() =>
    this.statistiques()
      .parRole.map((ligne, index) => ({ ...ligne, slot: index + 1 }))
      .filter((ligne) => ligne.effectif > 0),
  );

  /** `true` si une recherche ou un filtre de rôle est actif. */
  protected readonly filtresActifs = computed(() => this.recherche() !== '' || this.roleFiltre() !== null);

  /** Charge l'annuaire à l'ouverture de la page. */
  ngOnInit(): void {
    this.charger();
  }

  /** Récupère les employés via le service (GET). */
  protected charger(): void {
    this.erreur.set(null);
    this.employeService
      .getEmployes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.chargement.set(false),
        error: (erreur: unknown) => {
          this.erreur.set(messageErreur(erreur));
          this.chargement.set(false);
        },
      });
  }

  /** Relance le chargement après une erreur. */
  protected recharger(): void {
    this.chargement.set(this.total() === 0);
    this.charger();
  }

  /** Active un filtre de rôle, ou le désactive s'il l'était déjà. */
  protected basculerRole(role: EmployeRole): void {
    this.roleFiltre.update((actuel) => (actuel === role ? null : role));
  }

  /** Efface la recherche et le filtre de rôle. */
  protected reinitialiserFiltres(): void {
    this.recherche.set('');
    this.roleFiltre.set(null);
  }

  /** Ouvre la confirmation de suppression. */
  protected demanderSuppression(employe: Employe): void {
    this.aSupprimer.set(employe);
  }

  /** Ferme la confirmation sans rien supprimer. */
  protected annulerSuppression(): void {
    if (!this.suppressionEnCours()) {
      this.aSupprimer.set(null);
    }
  }

  /** Supprime l'employé confirmé (DELETE) et informe l'utilisateur du résultat. */
  protected confirmerSuppression(): void {
    const employe = this.aSupprimer();
    if (!employe) {
      return;
    }

    this.suppressionEnCours.set(true);
    this.employeService
      .deleteEmploye(employe.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.succes('Fiche supprimée', `${employe.name} ne fait plus partie de l'annuaire.`);
          this.terminerSuppression();
        },
        error: (erreur: unknown) => {
          this.notifications.erreur('Suppression impossible', messageErreur(erreur));
          this.terminerSuppression();
        },
      });
  }

  /** Remet la boîte de confirmation à zéro. */
  private terminerSuppression(): void {
    this.suppressionEnCours.set(false);
    this.aSupprimer.set(null);
  }
}
