import { CrudService } from './crud.service';
import { PatientEndpointEnum } from '@/enum';
import type { ICreatePatientDto, IPatient, IPatientFilters, IUpdatePatientDto } from '@/interfaces';

class PatientsService extends CrudService<IPatient, ICreatePatientDto, IUpdatePatientDto, IPatientFilters> {
  constructor() {
    super(PatientEndpointEnum.BASE);
  }
}

const patientsService = new PatientsService();
export default patientsService;
