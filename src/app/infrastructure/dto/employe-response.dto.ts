/**
 * INFRASTRUCTURE — DTO de réponse : un employé tel que l'API MockAPI le renvoie.
 *
 * Il reflète EXACTEMENT le JSON reçu et ne sort jamais de l'infrastructure :
 * le mapper le convertit en `Employe`, le modèle du core.
 */
export interface EmployeResponseDto {
  id: string;
  name: string;
  /** Absent sur certains enregistrements. */
  email?: string;
  image: string;
  fonction: string;
  role: string;
  /** Champ technique généré par MockAPI. */
  createdAt: string;
}
