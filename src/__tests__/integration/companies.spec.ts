import connection from '@shared/utils/connection';
import request from 'supertest';
import app from '@shared/infra/http/server';
import CompaniesRepository from '@modules/companies/infra/typeorm/repositories/CompaniesRepository';
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

    it('Should receive error when trying to upload invalid file type', async () => {
      const response = await request(app)
        .post(`/company/integrate`)
        .set('Content-type', 'multipart/form-data')
        .attach('csv', path.resolve(__dirname, '..', 'seeds', 'favicon.png'));

      expect(response.status).toEqual(400);
      expect(response.body.error[0]).toEqual('Invalid file type');
    });

    it('Should receive error when attach no file', async () => {
      const response = await request(app).post(`/company/integrate`);

      expect(response.status).toEqual(400);
      expect(response.body.error[0]).toEqual('A CSV file is required');
    });
  });

  describe('Find', () => {
    let companies = [];

    beforeAll(async () => {
      await connection.clear();
      await request(app).post(`/company/load`);

      const repo = new CompaniesRepository();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [companiesDB, _] = await repo.findAllAndCount();
      companies = companiesDB;
    });

    it('Should find company with full name', async () => {
      const response = await request(app).get(
        `/company/find?zipcode=${companies[0].zipcode}&name=${companies[0].name}`,
      );

      expect(response.status).toEqual(200);
      expect(response.body.id).not.toBeNull();
      expect(companies[0].id).toEqual(response.body.id);
      expect(companies[0].name).toEqual(response.body.name);
    });

    it('Should find company with incompleted name', async () => {
      const companyFind = companies.find(
        ({ name }) => name.split(' ').length > 1,
      );

      const splitedName = companyFind.name.split(' ');
      const responseFirst = await request(app).get(
        `/company/find?zipcode=${companyFind.zipcode}&name=${splitedName[0]}`,
      );
      expect(responseFirst.body.id).not.toBeNull();
      expect(responseFirst.body.name.includes(splitedName[0]));

      const responseSecond = await request(app).get(
        `/company/find?zipcode=${companyFind.zipcode}&name=${splitedName[1]}`,
      );

      expect(responseSecond.body.id).not.toBeNull();
      expect(responseSecond.body.name.includes(splitedName[1]));
      expect(responseFirst.body.id).toEqual(responseSecond.body.id);
    });

    it('Should not find company with invalid name', async () => {
      const response = await request(app).get(
        `/company/find?zipcode=${companies[0].zipcode}&name=aaaaaaaaaaaaaa}`,
      );

      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual('Cannot find company');
    });

    it('Should receive error when name is not informed', async () => {
      const response = await request(app).get(
        `/company/find?zipcode=${companies[0].zipcode}}`,
      );

      expect(response.status).toEqual(400);
      expect(response.body.error[0]).toEqual('name is a required field');
    });

    it('Should receive error when zipcode is not informed', async () => {
      const response = await request(app).get(
        `/company/find?name=${companies[0].name}}`,
      );

      expect(response.status).toEqual(400);
      expect(response.body.error[0]).toEqual('zipcode is a required field');
    });
  });
});
