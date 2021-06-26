import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '@config/uploadConfig';

import CompanyController from '../../controllers/CompanyController';

const companyRouter = Router();

const upload = multer(uploadConfig);

companyRouter.post('/load', new CompanyController().loadCSV);

companyRouter.post(
  '/integrate',
  upload.single('csv'),
  new CompanyController().integrateCSV,
);

export default companyRouter;
