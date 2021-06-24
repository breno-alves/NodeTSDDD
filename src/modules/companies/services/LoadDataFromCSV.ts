import { injectable, inject } from 'tsyringe';
import { createReadStream } from 'fs';
import { Transform } from 'stream';
import { resolve } from 'path';
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

  private pushDataToDatabase(companiesRepository: ICompaniesRepository) {
    return (chunk: Array<IValidatedObject>, _, next) => {
      Promise.all(
        chunk.map(async ({ name, zipcode }) => {
          const companyExists = await companiesRepository.find({
            name,
            zipcode,
          });

          if (!companyExists) {
            await companiesRepository.create({ name, zipcode });
          }
        }),
      ).then(next(null, chunk));
    };
  }

  public async execute(): Promise<void> {
    const readStream = createReadStream(
      resolve(__dirname, '..', '..', '..', 'shared', 'seed', 'q1_catalog.csv'),
      { encoding: 'utf8' },
    );
    readStream
      .pipe(new Transform({ objectMode: true, transform: this.dataToObjects }))
      .pipe(
        new Transform({ objectMode: true, transform: this.validateObjects }),
      )
      .pipe(
        new Transform({
          objectMode: true,
          transform: this.pushDataToDatabase(this.companiesRepository),
        }),
      );
  }
}
