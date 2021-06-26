import { injectable, inject } from 'tsyringe';
import { createReadStream } from 'fs';
import { Transform } from 'stream';
import { resolve as resolvePath } from 'path';
import ICompaniesRepository from '../repositories/ICompaniesRepository';

interface IValidatedObject {
  name: string;
  zipcode: string;
}

@injectable()
export default class LoadDataFromCSV {
  private companiesRepository: ICompaniesRepository;

  constructor(
    @inject('CompaniesRepository')
    companiesRepository: ICompaniesRepository,
  ) {
    this.companiesRepository = companiesRepository;
  }

  private dataToObjects(chunk, _, next) {
    const dataArray = chunk.split('\n');
    const objectsArray = dataArray.map((str: string) => str.split(';'));
    next(null, objectsArray);
  }

  private validateObjects(chunk, _, next) {
    const validatedObjects = chunk.reduce(
      (acc: Array<IValidatedObject>, [name, zipcode]) => {
        if (zipcode.length === 5) {
          acc.push({
            name,
            zipcode,
          });
        }
        return acc;
      },
      [],
    );
    next(null, validatedObjects);
  }

  private async pushDataToDatabase(
    companiesRepository: ICompaniesRepository,
    chunk,
  ) {
    return Promise.all(
      chunk.map(async ({ name, zipcode }) => {
        const companyExists = await companiesRepository.find({
          name: name.toUpperCase(),
          zipcode,
        });

        if (!companyExists) {
          await companiesRepository.create({ name, zipcode });
        }
      }),
    );
  }

  public async execute(): Promise<void> {
    const readStream = createReadStream(
      resolvePath(
        __dirname,
        '..',
        '..',
        '..',
        'shared',
        'seed',
        'q1_catalog.csv',
      ),
      { encoding: 'utf8' },
    );

    return new Promise((resolve, reject) => {
      const promises = [];

      readStream
        .pipe(
          new Transform({ objectMode: true, transform: this.dataToObjects }),
        )
        .pipe(
          new Transform({
            objectMode: true,
            transform: this.validateObjects,
          }),
        )
        .on('data', row => {
          promises.push(this.pushDataToDatabase(this.companiesRepository, row));
        })
        .on('error', err => {
          reject(err);
        })
        .on('end', async () => {
          await Promise.all(promises);
          resolve();
        });
    });
  }
}
