import { inject, injectable } from 'tsyringe';
import Company from '../infra/typeorm/entities/Company';
import ICompaniesRepository from '../repositories/ICompaniesRepository';

@injectable()
export default class FindCompany {
  private companiesRepository: ICompaniesRepository;

  constructor(
    @inject('CompaniesRepository')
    companiesRepository: ICompaniesRepository,
  ) {
    this.companiesRepository = companiesRepository;
  }

  public async execute(
    zipcode: string,
    name: string,
  ): Promise<Company | undefined> {
    return this.companiesRepository.find({
      zipcode,
      name: name.toUpperCase(),
    });
  }
}
