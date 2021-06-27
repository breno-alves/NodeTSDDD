import { injectable, inject } from 'tsyringe';
import { createReadStream } from 'fs';
import { Transform } from 'stream';
import ICompaniesRepository from '../repositories/ICompaniesRepository';

interface IValidatedObject {
  name: string;
  zipcode: string;
  website: string;
}

@injectable()
export default class MergeDataFromCSV {
  private companiesRepository: ICompaniesRepository;

  constructor(
    @inject('CompaniesRepository') companiesRepository: ICompaniesRepository,
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
      (
        acc: Array<IValidatedObject>,
        [name, zipcode, website]: [string, string, string],
      ) => {
        if (zipcode.length === 5) {
          acc.push({
            name: name.toUpperCase(),
            zipcode,
            website,
          });
        }
        return acc;
      },
      [],
    );
    next(null, validatedObjects);
  }

  private pushDataToDatabase(companiesRepository: ICompaniesRepository, chunk) {
    return Promise.all(
      chunk.map(async ({ name, zipcode, website }) => {
        const companyExists = await companiesRepository.find({
          name,
          zipcode,
        });

        if (companyExists) {
          companyExists.website = website;
          await companiesRepository.save(companyExists);
        }
      }),
    );
  }

  public async execute(filePath: string): Promise<void> {
    const readStream = createReadStream(filePath, { encoding: 'utf8' });

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
