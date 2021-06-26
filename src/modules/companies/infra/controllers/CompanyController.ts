import { Request, Response } from 'express';
import { container } from 'tsyringe';
import LoadDataFromCSV from '@modules/companies/services/LoadDataFromCSV';
import MergeDataFromCSV from '@modules/companies/services/MergeDataFromCSV';

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
}
