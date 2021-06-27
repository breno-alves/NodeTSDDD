import connection from '@shared/utils/connection';
import request from 'supertest';
import app from '@shared/infra/http/server';
import CompaniesRepository from '@modules/companies/infra/typeorm/repositories/CompaniesRepository';
import fs from 'fs';
import path from 'path';

describe('Companies', () => {
  beforeAll(async () => {
    await connection.create();
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  describe('Load', () => {
    beforeEach(async () => {
      await connection.clear();
    });

    it('Should read CSV and extract data to DB', async () => {
      await request(app).post(`/company/load`);

      const repo = new CompaniesRepository();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, count] = await repo.findAllAndCount();

      expect(count).toBeGreaterThan(0);
    });

    it('Should have no duplicate', async () => {
      await request(app).post(`/company/load`);

      const repo = new CompaniesRepository();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [companies, count] = await repo.findAllAndCount();

      await request(app).post(`/company/load`);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [companiesNew, countNew] = await repo.findAllAndCount();

      expect(count).toBeGreaterThan(0);
      expect(countNew).toEqual(count);
    });

    it('Should have only uppercased names', async () => {
      await request(app).post(`/company/load`);

      const repo = new CompaniesRepository();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [companies, count] = await repo.findAllAndCount();

      const namesLowercase = companies.reduce((acc, { name }) => {
        if (name !== name.toUpperCase()) {
          acc.push(name);
        }
        return acc;
      }, []);

      expect(namesLowercase.length).toEqual(0);
    });

    it('Should have only lowercased website', async () => {
      await request(app).post(`/company/load`);

      const repo = new CompaniesRepository();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [companies, count] = await repo.findAllAndCount();

      const websiteUppercase = companies.reduce((acc, { website }) => {
        if (website != null && website !== website.toLowerCase()) {
          acc.push(website);
        }
        return acc;
      }, []);

      expect(websiteUppercase.length).toEqual(0);
    });
  });

  describe('Integrate', () => {
    beforeEach(async () => {
      await connection.clear();
    });

    it('Should integrate database data with integration data', async () => {
      await request(app).post(`/company/load`);

      await request(app)
        .post(`/company/integrate`)
        .set('Content-type', 'multipart/form-data')
        .attach(
          'csv',
          path.resolve(__dirname, '..', 'seeds', 'q2_clientData.csv'),
        );

      const repo = new CompaniesRepository();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [companies, count] = await repo.findAllAndCount();

      const websites = companies.reduce((acc, { website }) => {
        if (website !== null) {
          acc.push(website);
        }
        return acc;
      }, []);

      expect(websites.length).toBeGreaterThan(0);
    });

    it('Should discart data if company not in database', async () => {
      await request(app).post(`/company/load`);
      const repo = new CompaniesRepository();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [companies, count] = await repo.findAllAndCount();

      await request(app)
        .post(`/company/integrate`)
        .set('Content-type', 'multipart/form-data')
        .attach(
          'csv',
          path.resolve(__dirname, '..', 'seeds', 'q2_clientData.csv'),
        );

      const [companiesNew, countNew] = await repo.findAllAndCount();

      expect(companiesNew.length).toEqual(companies.length);
    });
  });
});
