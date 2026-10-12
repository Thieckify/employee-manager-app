/**
 * CORE — Erreurs métier.
 *
 * Le reste de l'application ne voit jamais d'erreur HTTP : l'infrastructure
 * les traduit en erreurs ci-dessous, dont le message est directement
 * affichable à l'utilisateur.
 */

/** Erreur métier de base. */
export class EmployeError extends Error {}

/** L'employé demandé n'existe pas (ou plus). */
export class EmployeIntrouvableError extends EmployeError {
  constructor() {
    super("Cet employé n'existe pas ou a déjà été supprimé.");
  }
}

/** Un autre employé utilise déjà cette adresse e-mail. */
export class EmailDejaUtiliseError extends EmployeError {
  readonly email: string;

  constructor(email: string) {
    super(`L'adresse ${email} est déjà attribuée à un autre employé.`);
    this.email = email;
  }
}

/** Les données saisies violent une règle métier. */
export class EmployeInvalideError extends EmployeError {}

/** Le serveur ne répond pas (réseau coupé, panne…). */
export class ServeurIndisponibleError extends EmployeError {
  constructor() {
    super('Le serveur est injoignable. Vérifiez votre connexion puis réessayez.');
  }
}

/** Traduit n'importe quelle erreur en un message lisible par l'utilisateur. */
export function messageErreur(erreur: unknown): string {
  return erreur instanceof EmployeError
    ? erreur.message
    : 'Une erreur inattendue est survenue. Réessayez dans un instant.';
}
