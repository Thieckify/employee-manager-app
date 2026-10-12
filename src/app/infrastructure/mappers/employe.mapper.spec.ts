import { EmployeInput } from '../../core/models/employe.model';
import { EmployeResponseDto } from '../dto/employe-response.dto';
import { toCreateEmployeDto, toEmploye, toUpdateEmployeDto } from './employe.mapper';

describe('employe.mapper', () => {
  const reponse: EmployeResponseDto = {
    id: '7',
    name: 'Awa Ba',
    email: 'awa.ba@entreprise.sn',
    image: 'https://exemple.sn/awa.png',
    fonction: 'Designer UI/UX',
    role: 'Senior',
    createdAt: '123',
  };

  const saisie: EmployeInput = {
    name: 'Awa Ba',
    email: 'awa.ba@entreprise.sn',
    image: '',
    fonction: 'Designer',
    role: 'Senior',
  };

  it('convertit le DTO de réponse en employé', () => {
    expect(toEmploye(reponse)).toEqual(reponse);
  });

  it('remplace un e-mail absent par une chaîne vide', () => {
    const { email: _email, ...sansEmail } = reponse;

    expect(toEmploye(sansEmail).email).toBe('');
  });

  it('construit le DTO de création avec tous les champs, sans id ni createdAt', () => {
    expect(Object.keys(toCreateEmployeDto(saisie)).sort()).toEqual(['email', 'fonction', 'image', 'name', 'role']);
  });

  it('construit le DTO de modification avec le même contenu que la création', () => {
    expect(toUpdateEmployeDto(saisie)).toEqual(toCreateEmployeDto(saisie));
  });
});
