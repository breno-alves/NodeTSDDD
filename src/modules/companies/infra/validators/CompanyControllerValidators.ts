import * as Yup from 'yup';

export const controllerValidatorFind = async (obj: any): Promise<void> => {
  const schema = Yup.object().shape({
    zipcode: Yup.string().length(5).required(),
    name: Yup.string().required(),
  });
  await schema.validate(obj);
};

export const controllerValidatorIntegrate = async (obj: any): Promise<void> => {
  const schema = Yup.object().shape({
    file: Yup.mixed()
      .required('A CSV file is required')
      .test('fileFormat', 'Invalid file type', value => {
        return value && ['text/csv'].includes(value.mimetype);
      }),
  });
  await schema.validate(obj);
};
