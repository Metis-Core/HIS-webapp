import { OrderEndpointEnum } from '@/enum';
import { CrudService } from './crud.service';
import type {
  ICreateProcedureTestDto,
  IProcedureTest,
  IProcedureTestFilters,
  IUpdateProcedureTestDto,
} from '@/interfaces';

class ProcedureTestsService extends CrudService<
  IProcedureTest,
  ICreateProcedureTestDto,
  IUpdateProcedureTestDto,
  IProcedureTestFilters
> {
  constructor() {
    super(OrderEndpointEnum.TESTS);
  }
}

export const procedureTestsService = new ProcedureTestsService();
