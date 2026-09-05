import { CrudService } from './crud.service';
import { ServiceEndpointEnum } from '@/enum';
import type { ICreateServiceDto, IService, IServiceFilters, IUpdateServiceDto } from '@/interfaces';

class ServicesService extends CrudService<IService, ICreateServiceDto, IUpdateServiceDto, IServiceFilters> {
  constructor() {
    super(ServiceEndpointEnum.BASE);
  }
}

const servicesService = new ServicesService();
export default servicesService;
