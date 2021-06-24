import { Router } from 'express';
import CompanyController from '../../controllers/CompanyController';

const companyRouter = Router();

companyRouter.post('/load', new CompanyController().loadCSV);

export default companyRouter;
