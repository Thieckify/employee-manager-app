import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Icônes disponibles dans le sprite `public/icons.svg`. */
export type IconName =
  | 'plus'
  | 'search'
  | 'search-x'
  | 'mail'
  | 'pencil'
  | 'trash'
  | 'users'
  | 'user'
  | 'briefcase'
  | 'award'
  | 'chart'
  | 'grid'
  | 'list'
  | 'x'
  | 'check'
  | 'alert'
  | 'arrow-left'
  | 'refresh'
  | 'image';

/**
 * SHARED/UI — Icône vectorielle issue du sprite SVG (un seul fichier, mis en cache).
 * Décorative : le sens est toujours porté par un texte voisin ou un `aria-label`.
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <use [attr.href]="'icons.svg#' + name()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }
    svg {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  /** Nom de l'icône dans le sprite. */
  readonly name = input.required<IconName>();
  /** Taille en pixels. */
  readonly size = input(18);
}
