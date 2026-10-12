import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';

import { Icon } from '../icon/icon';

/**
 * SHARED/UI — Avatar rond.
 *
 * Affiche la photo si elle se charge ; sinon des initiales sur un dégradé
 * dont la teinte est dérivée du nom (une personne garde toujours la même couleur).
 * Décoratif : le nom est toujours affiché à côté.
 */
@Component({
  selector: 'app-avatar',
  imports: [Icon],
  template: `
    @if (initiales()) {
      <span class="initiales">{{ initiales() }}</span>
    } @else {
      <app-icon name="user" [size]="taille() * 0.42" />
    }
    @if (image() && !echec()) {
      <img [src]="image()" alt="" decoding="async" (error)="echec.set(true)" />
    }
  `,
  styles: `
    :host {
      position: relative;
      display: inline-grid;
      flex-shrink: 0;
      place-items: center;
      width: var(--taille);
      height: var(--taille);
      overflow: hidden;
      border-radius: 50%;
      background: linear-gradient(140deg, hsl(var(--teinte) 55% 88%), hsl(calc(var(--teinte) + 35) 50% 78%));
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 6%);
      color: hsl(var(--teinte) 45% 28%);
    }
    .initiales {
      font-size: calc(var(--taille) * 0.36);
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    @media (prefers-color-scheme: dark) {
      :host {
        background: linear-gradient(140deg, hsl(var(--teinte) 30% 30%), hsl(calc(var(--teinte) + 35) 30% 21%));
        box-shadow: inset 0 0 0 1px rgb(255 255 255 / 8%);
        color: hsl(var(--teinte) 60% 84%);
      }
    }
  `,
  host: {
    'aria-hidden': 'true',
    '[style.--taille]': 'taille() + "px"',
    '[style.--teinte]': 'teinte()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
  /** Nom complet (sert aux initiales et à la couleur). */
  readonly nom = input('');
  /** URL de la photo (facultative). */
  readonly image = input('');
  /** Diamètre en pixels. */
  readonly taille = input(48);

  /** `true` si la photo n'a pas pu se charger ; réinitialisé à chaque nouvelle URL. */
  protected readonly echec = linkedSignal({ source: this.image, computation: () => false });

  /** Initiale du premier et du dernier mot du nom (« Ndèye Fatou Faye » → « NF »). */
  protected readonly initiales = computed(() => {
    const mots = this.nom().trim().split(/\s+/).filter(Boolean);
    if (mots.length === 0) {
      return '';
    }
    const premier = mots[0][0];
    const dernier = mots.length > 1 ? mots[mots.length - 1][0] : '';
    return (premier + dernier).toUpperCase();
  });

  /** Teinte (0–359) stable dérivée du nom. */
  protected readonly teinte = computed(() => {
    let empreinte = 0;
    for (const caractere of this.nom()) {
      empreinte = (empreinte * 31 + caractere.codePointAt(0)!) >>> 0;
    }
    return empreinte % 360;
  });
}
