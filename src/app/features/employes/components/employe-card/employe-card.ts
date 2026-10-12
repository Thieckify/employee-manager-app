import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Employe } from '../../../../core/models/employe.model';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { Icon } from '../../../../shared/ui/icon/icon';
import { RoleBadge } from '../role-badge/role-badge';

/**
 * Carte d'un employé (vue grille). Composant de présentation pur :
 * il affiche ce qu'on lui donne et signale la demande de suppression.
 */
@Component({
  selector: 'app-employe-card',
  imports: [RouterLink, Avatar, Icon, RoleBadge],
  templateUrl: './employe-card.html',
  styleUrl: './employe-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeCard {
  /** Employé à afficher. */
  readonly employe = input.required<Employe>();

  /** Émis quand l'utilisateur demande la suppression de cet employé. */
  readonly supprimer = output<Employe>();
}
