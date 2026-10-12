import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, defer, map, switchMap, tap } from 'rxjs';

import { EmailDejaUtiliseError, EmployeInvalideError } from '../models/employe.errors';
import {
  EMPLOYE_ROLES,
  Employe,
  EmployeFiltre,
  EmployeInput,
  EmployeRole,
  EmployeStatistiques,
  ROLES_ENCADREMENT,
} from '../models/employe.model';
import { EmployeRepository } from '../repositories/employe.repository';

/** Valeur parasite produite par le générateur de MockAPI quand un champ n'est pas fourni. */
const VALEUR_GENEREE_INVALIDE = /invalid faker method/i;

/** Format d'e-mail accepté (en plus de la validation du formulaire). */
const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Service d'avatars illustrés utilisé quand un employé n'a pas de photo. */
const AVATAR_API = 'https://api.dicebear.com/9.x/notionists/svg';

/** Fonds pastel des avatars générés, assortis à la charte graphique. */
const AVATAR_FONDS = ['f1e4d3', 'dfe3f3', 'f5dcd5', 'd9e8df', 'e6e0f2', 'efe6c8', 'd7ebf0', 'f3dfe8'];

/**
 * CORE — Service métier des employés.
 *
 * C'est le point d'entrée UNIQUE des composants pour tout ce qui touche aux
 * employés. Il regroupe :
 *  - les 5 opérations CRUD demandées par l'énoncé ;
 *  - l'état partagé de l'annuaire (signal en lecture seule) ;
 *  - TOUTES les règles métier : nettoyage des données de l'API, validation,
 *    unicité de l'e-mail, avatar par défaut, tri hiérarchique, recherche
 *    et statistiques.
 *
 * Il ignore tout de HTTP : il passe par le port `EmployeRepository`, ce qui le
 * rend testable avec un faux dépôt et indépendant de la source de données.
 */
@Injectable({ providedIn: 'root' })
export class EmployeService {
  private readonly repository = inject(EmployeRepository);

  /** Annuaire en mémoire, toujours trié. Seul ce service peut le modifier. */
  private readonly annuaire = signal<Employe[]>([]);
  private readonly annuaireCharge = signal(false);

  /** Employés connus, triés par niveau hiérarchique puis par nom. */
  readonly employes = this.annuaire.asReadonly();

  /** `true` dès que l'annuaire a été chargé au moins une fois. */
  readonly estCharge = this.annuaireCharge.asReadonly();

  /** Indicateurs de l'équipe, recalculés automatiquement à chaque changement. */
  readonly statistiques = computed<EmployeStatistiques>(() => {
    const employes = this.annuaire();
    const effectif = employes.length;
    const encadrement = employes.filter((e) => this.estEncadrant(e)).length;
    const part = (n: number) => (effectif === 0 ? 0 : Math.round((n / effectif) * 100));

    return {
      effectif,
      encadrement,
      tauxEncadrement: part(encadrement),
      fonctions: new Set(employes.map((e) => this.simplifier(e.fonction)).filter(Boolean)).size,
      parRole: EMPLOYE_ROLES.map((role) => {
        const nombre = employes.filter((e) => e.role === role).length;
        return { role, effectif: nombre, part: part(nombre) };
      }),
    };
  });

  // ───────────────────────── Opérations CRUD (énoncé) ─────────────────────────

  /** Récupère tous les employés (GET), les nettoie, les trie et met l'annuaire à jour. */
  getEmployes(): Observable<Employe[]> {
    return this.repository.getAll().pipe(
      map((employes) => this.trier(employes.map((e) => this.normaliser(e)))),
      tap((employes) => {
        this.annuaire.set(employes);
        this.annuaireCharge.set(true);
      }),
    );
  }

  /** Récupère un employé à jour depuis l'API (GET), nettoyé. */
  getEmployeById(id: string): Observable<Employe> {
    return this.repository.getById(id).pipe(map((e) => this.normaliser(e)));
  }

  /**
   * Ajoute un employé (POST) après application des règles métier :
   * champs obligatoires, rôle du catalogue, e-mail valide et unique,
   * avatar généré si aucune photo n'est fournie.
   */
  addEmploye(saisie: EmployeInput): Observable<Employe> {
    // `defer` : une règle violée devient une erreur de l'Observable, pas une exception.
    return defer(() => {
      const donnees = this.preparer(saisie);
      return this.verifierEmailDisponible(donnees.email).pipe(
        switchMap(() => this.repository.create(donnees)),
      );
    }).pipe(
      map((e) => this.normaliser(e)),
      tap((cree) => this.annuaire.update((liste) => this.trier([...liste, cree]))),
    );
  }

  /** Met à jour un employé (PUT) avec les mêmes règles que l'ajout. */
  updateEmploye(id: string, saisie: EmployeInput): Observable<Employe> {
    return defer(() => {
      const donnees = this.preparer(saisie);
      return this.verifierEmailDisponible(donnees.email, id).pipe(
        switchMap(() => this.repository.update(id, donnees)),
      );
    }).pipe(
      map((e) => this.normaliser(e)),
      tap((modifie) =>
        this.annuaire.update((liste) => this.trier([...liste.filter((e) => e.id !== id), modifie])),
      ),
    );
  }

  /** Supprime un employé (DELETE) puis le retire de l'annuaire. */
  deleteEmploye(id: string): Observable<void> {
    return this.repository
      .delete(id)
      .pipe(tap(() => this.annuaire.update((liste) => liste.filter((e) => e.id !== id))));
  }

  // ───────────────────────────── Requêtes métier ──────────────────────────────

  /**
   * Filtre l'annuaire. La recherche ignore la casse et les accents
   * (« ndeye » trouve « Ndèye ») et porte sur le nom, l'e-mail, la fonction et le rôle.
   */
  filtrer({ recherche, role }: EmployeFiltre): Employe[] {
    const terme = this.simplifier(recherche);

    return this.annuaire().filter(
      (e) =>
        (role === null || e.role === role) &&
        (terme === '' ||
          [e.name, e.email, e.fonction, e.role].some((champ) => this.simplifier(champ).includes(terme))),
    );
  }

  /** Un employé fait partie de l'encadrement s'il est Direction, Manager ou Lead. */
  estEncadrant(employe: Employe): boolean {
    return (ROLES_ENCADREMENT as readonly string[]).includes(employe.role);
  }

  // ───────────────────────────── Règles internes ──────────────────────────────

  /**
   * Vérifie qu'aucun AUTRE employé n'utilise déjà cet e-mail.
   * L'annuaire est rechargé avant la vérification : l'API est partagée,
   * d'autres personnes ont pu ajouter des fiches entre-temps.
   */
  private verifierEmailDisponible(email: string, idCourant?: string): Observable<void> {
    return this.getEmployes().pipe(
      map((employes) => {
        if (employes.some((e) => e.id !== idCourant && e.email === email)) {
          throw new EmailDejaUtiliseError(email);
        }
      }),
    );
  }

  /** Nettoie et valide une saisie avant envoi. Lève `EmployeInvalideError` si une règle est violée. */
  private preparer(saisie: EmployeInput): EmployeInput {
    const donnees: EmployeInput = {
      name: this.nettoyer(saisie.name),
      email: this.nettoyer(saisie.email).toLowerCase(),
      fonction: this.nettoyer(saisie.fonction),
      role: this.nettoyer(saisie.role),
      image: this.nettoyer(saisie.image),
    };

    if (!donnees.name || !donnees.fonction) {
      throw new EmployeInvalideError('Le nom et la fonction sont obligatoires.');
    }
    if (!FORMAT_EMAIL.test(donnees.email)) {
      throw new EmployeInvalideError("L'adresse e-mail n'est pas valide.");
    }
    if (!this.estRoleConnu(donnees.role)) {
      throw new EmployeInvalideError(`Le rôle « ${donnees.role} » ne fait pas partie du catalogue.`);
    }

    return { ...donnees, image: donnees.image || this.avatarParDefaut(donnees.name) };
  }

  /** Nettoie un employé venant de l'API (données partagées, potentiellement incomplètes). */
  private normaliser(employe: Employe): Employe {
    return {
      ...employe,
      name: this.nettoyer(employe.name),
      email: this.nettoyer(employe.email).toLowerCase(),
      fonction: this.nettoyer(employe.fonction),
      role: this.nettoyer(employe.role),
      image: this.nettoyer(employe.image),
    };
  }

  /** Supprime les espaces superflus et neutralise les valeurs générées invalides. */
  private nettoyer(valeur: string | undefined): string {
    const texte = (valeur ?? '').replace(/\s+/g, ' ').trim();
    return VALEUR_GENEREE_INVALIDE.test(texte) ? '' : texte;
  }

  /** Trie par niveau hiérarchique (ordre du catalogue), puis par nom. Rôles inconnus en dernier. */
  private trier(employes: Employe[]): Employe[] {
    return [...employes].sort(
      (a, b) => this.rang(a.role) - this.rang(b.role) || a.name.localeCompare(b.name, 'fr'),
    );
  }

  /** Position d'un rôle dans le catalogue (les rôles inconnus passent après tous les autres). */
  private rang(role: string): number {
    const position = EMPLOYE_ROLES.indexOf(role as EmployeRole);
    return position === -1 ? EMPLOYE_ROLES.length : position;
  }

  /** Indique si le rôle fait partie du catalogue. */
  private estRoleConnu(role: string): role is EmployeRole {
    return (EMPLOYE_ROLES as readonly string[]).includes(role);
  }

  /** Avatar illustré stable : un même nom donne toujours le même avatar. */
  private avatarParDefaut(nom: string): string {
    let empreinte = 0;
    for (const caractere of nom) {
      empreinte = (empreinte * 31 + caractere.codePointAt(0)!) >>> 0;
    }
    const fond = AVATAR_FONDS[empreinte % AVATAR_FONDS.length];
    return `${AVATAR_API}?seed=${encodeURIComponent(nom)}&backgroundColor=${fond}`;
  }

  /** Forme comparable d'un texte : minuscules, sans accents ni espaces de bord. */
  private simplifier(texte: string): string {
    return texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  }
}
