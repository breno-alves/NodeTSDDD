import CreateCompanyDTO from '../dtos/CreateCompanyDTO';
import Company from '../infra/typeorm/entities/Company';

export default interface ICompaniesRepository {
  create(data: CreateCompanyDTO): Promise<Company>;
  save(company: Company): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  find(attributes: Partial<Company>): Promise<Company>;
}
