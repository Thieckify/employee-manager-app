/**
 * INFRASTRUCTURE — DTO de création : corps envoyé par `POST /employes`.
 *
 * Tous les champs sont obligatoires : un champ absent serait rempli par
 * MockAPI avec une valeur générée invalide (« Invalid faker method »).
 * `id` et `createdAt` sont attribués par l'API, ils ne sont jamais envoyés.
 */
export interface CreateEmployeDto {
  name: string;
  email: string;
  image: string;
  fonction: string;
  role: string;
}
