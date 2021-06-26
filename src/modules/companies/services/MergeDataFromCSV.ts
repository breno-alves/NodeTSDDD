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

  private pushDataToDatabase(companiesRepository: ICompaniesRepository) {
    return (chunk: Array<IValidatedObject>, _, next) => {
      Promise.all(
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
      ).then(next(null, chunk));
    };
  }

  public async execute(filePath: string): Promise<void> {
    const readStream = createReadStream(filePath, { encoding: 'utf8' });
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
