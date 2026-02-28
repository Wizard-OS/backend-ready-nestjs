import * as bcrypt from 'bcrypt';
import { ValidRoles } from '../../auth/interfaces';

export interface SeedUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: ValidRoles[];
}

interface SeedData {
  users: SeedUser[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'test1@google.com',
      firstName: 'Test',
      lastName: 'One',
      password: bcrypt.hashSync('Abc123', 10),
      roles: [ValidRoles.admin],
    },
    {
      email: 'test2@google.com',
      firstName: 'Test',
      lastName: 'Two',
      password: bcrypt.hashSync('Abc123', 10),
      roles: [ValidRoles.user, ValidRoles.superUser],
    },
  ],
};
