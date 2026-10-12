import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { EmployeStatistiques } from '../../../../core/models/employe.model';
import { Icon } from '../../../../shared/ui/icon/icon';

/**
 * Indicateurs de l'équipe : trois chiffres clés et la répartition par rôle.
 * Les calculs sont faits par `EmployeService` ; ce composant ne fait qu'afficher.
 */
@Component({
  selector: 'app-employe-stats',
  imports: [Icon],
  templateUrl: './employe-stats.html',
  styleUrl: './employe-stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeStats {
  /** Indicateurs calculés par le service. */
  readonly statistiques = input.required<EmployeStatistiques>();

  /** Rôles représentés, avec leur couleur (position dans le catalogue). */
  protected readonly segments = computed(() =>
    this.statistiques()
      .parRole.map((ligne, index) => ({ ...ligne, slot: index + 1 }))
      .filter((ligne) => ligne.effectif > 0),
  );

  /** Description textuelle de la répartition pour les lecteurs d'écran. */
  protected readonly resume = computed(
    () =>
      'Répartition par rôle : ' +
      this.segments()
        .map((s) => `${s.role} ${s.effectif}`)
        .join(', '),
  );
}
