import CreateCompanyDTO from '@modules/companies/dtos/CreateCompanyDTO';
import ICompaniesRepository from '@modules/companies/repositories/ICompaniesRepository';
import {
  getRepository,
  Repository,
  getManager,
  Like,
  FindOperator,
} from 'typeorm';
import Company from '../entities/Company';

interface CompanyFindWhere {
  id?: string;
  name?: string | FindOperator<string>;
  zipcode?: string;
  website?: string;
}

export default class CompaniesRepository implements ICompaniesRepository {
  private ormRepository: Repository<Company>;

  constructor() {
    this.ormRepository = getRepository(Company);
  }

  public async findAllAndCount(): Promise<[Company[], number]> {
    return this.ormRepository.findAndCount();
  }

  public async findById(id: string): Promise<Company | null> {
    return this.ormRepository.findOne(id);
  }

  public async find(attributes: Partial<Company>): Promise<Company> {
    const where: CompanyFindWhere = {
      ...attributes,
    };

    if (where.name) {
      where.name = Like(`%${attributes.name}%`);
    }

    return this.ormRepository.findOne({ where });
  }

  public async create(data: CreateCompanyDTO): Promise<Company> {
    const company = this.ormRepository.create(data);
    await this.save(company);
    return company;
  }

  public async save(company: Company): Promise<Company> {
    return getManager().transaction(transactionalEntityManager =>
      transactionalEntityManager.save(company),
    );
  }
}
