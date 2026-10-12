import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationService } from '../../../core/services/notification.service';
import { Icon } from '../icon/icon';

/**
 * SHARED/UI — Zone d'affichage des notifications (toasts).
 * Simple vue de `NotificationService` : elle n'a aucun état propre.
 */
@Component({
  selector: 'app-toast-outlet',
  imports: [Icon],
  template: `
    <div class="pile" aria-live="polite">
      @for (notification of notifications(); track notification.id) {
        <div class="toast" [class.toast--erreur]="notification.type === 'erreur'">
          <span class="toast__icone">
            <app-icon [name]="notification.type === 'erreur' ? 'alert' : 'check'" [size]="16" />
          </span>
          <div class="toast__texte">
            <p class="toast__titre">{{ notification.titre }}</p>
            @if (notification.message) {
              <p class="toast__message">{{ notification.message }}</p>
            }
          </div>
          <button
            type="button"
            class="btn btn-ghost btn-sm btn-icon"
            aria-label="Fermer la notification"
            (click)="fermer(notification.id)"
          >
            <app-icon name="x" [size]="15" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .pile {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 50;
      display: grid;
      gap: 10px;
      width: min(380px, calc(100vw - 32px));
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 8px 12px 14px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: var(--surface);
      box-shadow: var(--shadow-lg);
      animation: glisser 320ms var(--ease-out);
    }
    .toast__icone {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      border-radius: 50%;
      background: var(--accent-soft);
      color: var(--accent);
    }
    .toast--erreur .toast__icone {
      background: var(--danger-soft);
      color: var(--danger);
    }
    .toast__texte {
      flex: 1;
      min-width: 0;
      padding-top: 3px;
    }
    .toast__titre {
      font-size: 14px;
      font-weight: 600;
    }
    .toast__message {
      margin-top: 2px;
      font-size: 13px;
      color: var(--text-2);
    }
    @media (max-width: 560px) {
      .pile {
        right: 16px;
        bottom: 16px;
      }
    }
    @keyframes glisser {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastOutlet {
  private readonly notificationService = inject(NotificationService);

  /** Notifications à afficher. */
  protected readonly notifications = this.notificationService.notifications;

  /** Ferme une notification avant son expiration. */
  protected fermer(id: number): void {
    this.notificationService.fermer(id);
  }
}
