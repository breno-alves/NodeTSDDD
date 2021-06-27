import { Request, Response } from 'express';
import { container } from 'tsyringe';
import LoadDataFromCSV from '@modules/companies/services/LoadDataFromCSV';
import MergeDataFromCSV from '@modules/companies/services/MergeDataFromCSV';
import FindCompany from '@modules/companies/services/FindCompany';
import {
  controllerValidatorFind,
  controllerValidatorIntegrate,
} from '@modules/companies/infra/validators/CompanyControllerValidators';

export default class CompanyController {
  public async loadCSV(_: Request, response: Response): Promise<Response> {
    const loader = container.resolve(LoadDataFromCSV);
    await loader.execute();

    return response.status(200).json({ ok: true });
  }

  public async integrateCSV(
    request: Request,
    response: Response,
  ): Promise<Response> {
    try {
      await controllerValidatorIntegrate(request);

      const merger = container.resolve(MergeDataFromCSV);
      await merger.execute(request.file.path);

      return response.status(200).json({ ok: true });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }
  }

  public async find(request: Request, response: Response): Promise<Response> {
    try {
      const { zipcode, name } = request.query as any;
      await controllerValidatorFind({ zipcode, name });

      const finder = container.resolve(FindCompany);
      const company = await finder.execute(zipcode, name);

      return response
        .status(200)
        .json(company || { message: 'Cannot find company' });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }
  }
}
