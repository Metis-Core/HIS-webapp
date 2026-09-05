import { CrudService } from './crud.service';
import { UserEndpointEnum } from '@/enum';
import type { ICreateUserDto, IUpdateUserDto, IUser, IUserFilters } from '@/interfaces';

class UsersService extends CrudService<IUser, ICreateUserDto, IUpdateUserDto, IUserFilters> {
  constructor() {
    super(UserEndpointEnum.BASE);
  }
}

const usersService = new UsersService();
export default usersService;
