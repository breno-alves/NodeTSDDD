import { container } from 'tsyringe';

import CompaniesRepository from '@modules/companies/infra/typeorm/repositories/CompaniesRepository';
import ICompaniesRepository from '@modules/companies/repositories/ICompaniesRepository';

container.registerSingleton<ICompaniesRepository>(
  'CompaniesRepository',
  CompaniesRepository,
);
