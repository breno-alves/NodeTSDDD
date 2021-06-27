import * as Yup from 'yup';

export const controllerValidatorFind = async (obj: any): Promise<void> => {
  const schema = Yup.object().shape({
    zipcode: Yup.string().length(5).required(),
    name: Yup.string().required(),
  });
  await schema.validate(obj);
};
