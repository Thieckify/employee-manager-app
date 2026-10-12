import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Icon } from './shared/ui/icon/icon';
import { ToastOutlet } from './shared/ui/toast-outlet/toast-outlet';

/**
 * Composant racine : barre de navigation, page courante et notifications.
 * Aucune logique métier ici.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, ToastOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** Lien d'évitement : donne le focus au contenu principal sans changer d'URL. */
  protected allerAuContenu(event: Event, contenu: HTMLElement): void {
    event.preventDefault();
    contenu.focus();
  }
}
