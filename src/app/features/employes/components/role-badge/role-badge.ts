import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { EMPLOYE_ROLES, EmployeRole } from '../../../../core/models/employe.model';

/**
 * Pastille de rôle : point de couleur + libellé.
 * La couleur suit la position du rôle dans le catalogue (même code couleur
 * que la répartition des statistiques et les filtres).
 */
@Component({
  selector: 'app-role-badge',
  template: `<span class="point" aria-hidden="true"></span>{{ role() || 'Rôle non renseigné' }}`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 26px;
      padding: 0 10px 0 9px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-2);
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text-2);
      white-space: nowrap;
    }
    :host(.vide) {
      font-style: italic;
      color: var(--text-3);
    }
    .point {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--role, var(--text-3));
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--role, var(--text-3)) 18%, transparent);
    }
  `,
  host: {
    '[attr.data-slot]': 'slot()',
    '[class.vide]': '!role()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleBadge {
  /** Rôle à afficher. */
  readonly role = input('');

  /** Position (1 à 6) du rôle dans le catalogue, ou `null` s'il est inconnu. */
  protected readonly slot = computed(() => {
    const position = EMPLOYE_ROLES.indexOf(this.role() as EmployeRole);
    return position === -1 ? null : position + 1;
  });
}
