/**
 * CORE — Modèle métier « Employé ».
 *
 * Ce fichier ne contient que des types et des constantes : le vocabulaire
 * de l'application. Il ne dépend ni d'Angular, ni de HTTP, ni de l'API.
 * Les règles qui s'appliquent à ces données vivent dans `EmployeService`.
 */

/**
 * Catalogue des rôles, du plus haut au plus bas niveau hiérarchique.
 * L'ordre fait foi : il sert au tri, aux statistiques et aux couleurs.
 */
export const EMPLOYE_ROLES = ['Direction', 'Manager', 'Lead', 'Senior', 'Junior', 'Stagiaire'] as const;

/** Un rôle du catalogue. */
export type EmployeRole = (typeof EMPLOYE_ROLES)[number];

/** Rôles considérés comme de l'encadrement. */
export const ROLES_ENCADREMENT: readonly EmployeRole[] = ['Direction', 'Manager', 'Lead'];

/** Fonctions proposées en suggestion dans le formulaire (la saisie reste libre). */
export const FONCTIONS_SUGGEREES: readonly string[] = [
  'Directrice des ressources humaines',
  'Chef de projet digital',
  'Responsable comptable',
  'Développeuse full-stack',
  'Développeur mobile',
  'Ingénieur DevOps',
  'Designer UI/UX',
  'Data analyst',
  'Chargée de communication',
  'Juriste',
  'Commercial',
];

/** Employé tel que manipulé par l'application (interface demandée par l'énoncé). */
export interface Employe {
  /** Identifiant attribué par l'API. */
  id: string;
  /** Nom complet. */
  name: string;
  /** Adresse e-mail professionnelle (chaîne vide si inconnue). */
  email: string;
  /** URL de la photo ou de l'avatar. */
  image: string;
  /** Intitulé du poste (ex. : « Ingénieur DevOps »). */
  fonction: string;
  /**
   * Niveau dans l'organisation. Typé `string` et non `EmployeRole` :
   * l'API est partagée et peut contenir des rôles hors catalogue.
   */
  role: string;
  /** Champ technique renvoyé par l'API (lecture seule, jamais envoyé). */
  createdAt?: string;
}

/** Données saisies pour créer ou modifier un employé. */
export type EmployeInput = Omit<Employe, 'id' | 'createdAt'>;

/** Critères de recherche dans l'annuaire. */
export interface EmployeFiltre {
  /** Texte libre cherché dans le nom, l'e-mail, la fonction et le rôle. */
  recherche: string;
  /** Rôle à isoler, ou `null` pour tous. */
  role: EmployeRole | null;
}

/** Indicateurs calculés sur l'équipe. */
export interface EmployeStatistiques {
  effectif: number;
  encadrement: number;
  /** Part de l'encadrement dans l'effectif, en pourcentage arrondi. */
  tauxEncadrement: number;
  /** Nombre de fonctions distinctes. */
  fonctions: number;
  /** Effectif et part (en %) de chaque rôle du catalogue, dans l'ordre du catalogue. */
  parRole: { role: EmployeRole; effectif: number; part: number }[];
}
