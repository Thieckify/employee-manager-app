import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Employe } from '../../../../core/models/employe.model';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { Icon } from '../../../../shared/ui/icon/icon';
import { RoleBadge } from '../role-badge/role-badge';

/** Tableau des employés (vue liste). Composant de présentation pur. */
@Component({
  selector: 'app-employe-table',
  imports: [RouterLink, Avatar, Icon, RoleBadge],
  templateUrl: './employe-table.html',
  styleUrl: './employe-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeTable {
  /** Employés à afficher, dans l'ordre voulu. */
  readonly employes = input.required<Employe[]>();

  /** Émis quand l'utilisateur demande la suppression d'un employé. */
  readonly supprimer = output<Employe>();
}
