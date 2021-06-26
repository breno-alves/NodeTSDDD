import connection from '@shared/utils/connection';
import request from 'supertest';
import app from '@shared/infra/http/server';
import CompaniesRepository from '@modules/companies/infra/typeorm/repositories/CompaniesRepository';

describe('Companies', () => {
  beforeAll(async () => {
    await connection.create();
  });

  afterAll(async () => {
    await connection.clear();
    await connection.close();
  });

  it('Should read CSV and extract data to DB', async () => {
    await request(app).post(`/company/load`);

    const repo = new CompaniesRepository();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, count] = await repo.findAllAndCount();

    expect(count).toBeGreaterThan(0);
  });
});
