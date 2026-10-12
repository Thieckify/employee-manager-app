import { Injectable, signal } from '@angular/core';

/** Nature d'une notification. */
export type TypeNotification = 'succes' | 'erreur';

/** Message éphémère affiché à l'utilisateur (toast). */
export interface Notification {
  id: number;
  type: TypeNotification;
  titre: string;
  message: string;
}

/** Nombre maximal de notifications visibles en même temps. */
const MAX_VISIBLES = 3;

/**
 * CORE — Service de notifications.
 *
 * Il ne gère que l'état (la file des messages) : l'affichage est assuré par le
 * composant `ToastOutlet` (shared/ui), qui se contente de lire ce signal.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly file = signal<Notification[]>([]);
  private prochainId = 1;

  /** Notifications actuellement affichées, de la plus ancienne à la plus récente. */
  readonly notifications = this.file.asReadonly();

  /** Affiche une notification de succès. */
  succes(titre: string, message = ''): void {
    this.afficher('succes', titre, message, 4500);
  }

  /** Affiche une notification d'erreur (reste visible plus longtemps). */
  erreur(titre: string, message = ''): void {
    this.afficher('erreur', titre, message, 7000);
  }

  /** Ferme une notification. */
  fermer(id: number): void {
    this.file.update((liste) => liste.filter((n) => n.id !== id));
  }

  /** Ajoute une notification et programme sa fermeture automatique. */
  private afficher(type: TypeNotification, titre: string, message: string, dureeMs: number): void {
    const id = this.prochainId++;
    this.file.update((liste) => [...liste.slice(-(MAX_VISIBLES - 1)), { id, type, titre, message }]);
    setTimeout(() => this.fermer(id), dureeMs);
  }
}
