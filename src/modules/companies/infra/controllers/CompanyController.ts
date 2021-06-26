import { Request, Response } from 'express';
import { container } from 'tsyringe';
import LoadDataFromCSV from '@modules/companies/services/LoadDataFromCSV';
import MergeDataFromCSV from '@modules/companies/services/MergeDataFromCSV';
import FindCompany from '@modules/companies/services/FindCompany';

export default class CompanyController {
  public async loadCSV(_: Request, response: Response): Promise<Response> {
    const loader = container.resolve(LoadDataFromCSV);
    await loader.execute();

    return response.json({ ok: true });
  }

  public async integrateCSV(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const merger = container.resolve(MergeDataFromCSV);
    await merger.execute(request.file.path);

    return response.json({ ok: true });
  }

  public async find(request: Request, response: Response): Promise<Response> {
    const { zipcode, name } = request.query as any;

    const finder = container.resolve(FindCompany);
    const company = await finder.execute(zipcode, name);

    return response.json(company);
  }
}
