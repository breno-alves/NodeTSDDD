import LoadDataFromCSV from '@modules/companies/services/LoadDataFromCSV';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

export default class CompanyController {
  public async loadCSV(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const loader = container.resolve(LoadDataFromCSV);
    await loader.execute();

    return response.json({ ok: true });
  }
}
