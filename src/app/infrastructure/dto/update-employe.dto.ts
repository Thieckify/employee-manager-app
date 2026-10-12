import { CreateEmployeDto } from './create-employe.dto';

/**
 * INFRASTRUCTURE — DTO de modification : corps envoyé par `PUT /employes/:id`.
 *
 * PUT remplace la fiche entière : le contenu est donc le même qu'à la création.
 * Le type reste distinct pour que chaque opération ait son propre contrat.
 */
export type UpdateEmployeDto = CreateEmployeDto;
