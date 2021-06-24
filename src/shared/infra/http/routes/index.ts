import { Router } from 'express';
import companyRouter from '@modules/companies/infra/http/routes/company.routes';

const routes = Router();

routes.use('/company', companyRouter);

export default routes;
