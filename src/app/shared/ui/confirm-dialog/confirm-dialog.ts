import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

import { Icon } from '../icon/icon';

let prochainId = 0;

/**
 * SHARED/UI — Boîte de confirmation d'une action destructrice.
 *
 * Basée sur l'élément natif `<dialog>` : piège du focus, touche Échap et
 * fond assombri sont gérés par le navigateur. Le message est projeté
 * (`<ng-content>`) pour pouvoir contenir de la mise en forme.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Icon],
  template: `
    <dialog
      #dialogue
      class="dialogue"
      [attr.aria-labelledby]="idTitre"
      [attr.aria-describedby]="idMessage"
      (cancel)="surEchap($event)"
      (click)="surClicFond($event)"
    >
      <div class="dialogue__corps">
        <span class="dialogue__icone"><app-icon name="trash" [size]="20" /></span>
        <h2 class="dialogue__titre" [id]="idTitre">{{ titre() }}</h2>
        <div class="dialogue__message" [id]="idMessage"><ng-content /></div>

        <div class="dialogue__actions">
          <button type="button" class="btn btn-secondary" autofocus [disabled]="enCours()" (click)="annuler.emit()">
            Annuler
          </button>
          <button type="button" class="btn btn-danger" [disabled]="enCours()" (click)="confirmer.emit()">
            @if (enCours()) {
              <span class="spinner" aria-hidden="true"></span>
            }
            {{ libelleConfirmation() }}
          </button>
        </div>
      </div>
    </dialog>
  `,
  styles: `
    .dialogue {
      width: min(100% - 32px, 420px);
      padding: 0;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      color: var(--text);
      box-shadow: var(--shadow-lg);
    }
    .dialogue[open] {
      animation: entrer 220ms var(--ease-out);
    }
    .dialogue::backdrop {
      background: rgb(12 12 10 / 45%);
      backdrop-filter: blur(3px);
    }
    .dialogue__corps {
      display: grid;
      gap: 8px;
      padding: 24px;
    }
    .dialogue__icone {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      margin-bottom: 8px;
      border-radius: 12px;
      background: var(--danger-soft);
      color: var(--danger);
    }
    .dialogue__titre {
      font-size: 17px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .dialogue__message {
      font-size: 14px;
      color: var(--text-2);
    }
    .dialogue__actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 18px;
    }
    @keyframes entrer {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.97);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  /** Ouvre ou ferme la boîte. */
  readonly ouvert = input(false);
  /** Question posée. */
  readonly titre = input.required<string>();
  /** Libellé du bouton de confirmation. */
  readonly libelleConfirmation = input('Confirmer');
  /** Action en cours : boutons désactivés, fermeture bloquée. */
  readonly enCours = input(false);

  /** Émis quand l'utilisateur confirme. */
  readonly confirmer = output<void>();
  /** Émis quand l'utilisateur renonce (bouton, Échap ou clic sur le fond). */
  readonly annuler = output<void>();

  protected readonly idTitre = `dialogue-titre-${++prochainId}`;
  protected readonly idMessage = `dialogue-message-${prochainId}`;

  private readonly dialogue = viewChild.required<ElementRef<HTMLDialogElement>>('dialogue');

  constructor() {
    // Synchronise l'élément natif avec l'input `ouvert`.
    effect(() => {
      const element = this.dialogue().nativeElement;
      if (this.ouvert() && !element.open) {
        element.showModal?.();
      } else if (!this.ouvert() && element.open) {
        element.close();
      }
    });
  }

  /** Échap : la fermeture passe par le parent (et est bloquée pendant l'action). */
  protected surEchap(event: Event): void {
    event.preventDefault();
    if (!this.enCours()) {
      this.annuler.emit();
    }
  }

  /** Un clic sur le fond (hors du contenu) vaut annulation. */
  protected surClicFond(event: MouseEvent): void {
    if (event.target === this.dialogue().nativeElement && !this.enCours()) {
      this.annuler.emit();
    }
  }
}
