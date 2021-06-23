import CreateCompanyDTO from '@modules/companies/dtos/CreateCompanyDTO';
import ICompaniesRepository from '@modules/companies/repositories/ICompaniesRepository';
import { getRepository, Repository } from 'typeorm';
import Company from '../entities/Company';

export default class CompaniesRepository implements ICompaniesRepository {
  private ormRepository: Repository<Company>;

  constructor() {
    this.ormRepository = getRepository(Company);
  }

  public async findById(id: string): Promise<Company | null> {
    return this.ormRepository.findOne(id);
  }

  public async create(data: CreateCompanyDTO): Promise<Company> {
    const company = this.ormRepository.create(data);
    await this.save(company);
    return company;
  }

  public async save(company: Company): Promise<Company> {
    return this.ormRepository.save(company);
  }
}
