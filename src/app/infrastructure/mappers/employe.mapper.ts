import { Employe, EmployeInput } from '../../core/models/employe.model';
import { CreateEmployeDto } from '../dto/create-employe.dto';
import { EmployeResponseDto } from '../dto/employe-response.dto';
import { UpdateEmployeDto } from '../dto/update-employe.dto';

/**
 * INFRASTRUCTURE — Conversions entre les DTO de l'API et le modèle du core.
 * Uniquement structurelles : aucune règle métier ici (le nettoyage des
 * valeurs est fait par EmployeService).
 */

/** Convertit la réponse de l'API en `Employe`. */
export function toEmploye(dto: EmployeResponseDto): Employe {
  return {
    id: dto.id,
    name: dto.name ?? '',
    email: dto.email ?? '',
    image: dto.image ?? '',
    fonction: dto.fonction ?? '',
    role: dto.role ?? '',
    createdAt: dto.createdAt,
  };
}

/** Convertit une saisie en corps de création (POST). */
export function toCreateEmployeDto(input: EmployeInput): CreateEmployeDto {
  return {
    name: input.name,
    email: input.email,
    image: input.image,
    fonction: input.fonction,
    role: input.role,
  };
}

/** Convertit une saisie en corps de modification (PUT). */
export function toUpdateEmployeDto(input: EmployeInput): UpdateEmployeDto {
  return toCreateEmployeDto(input);
}
