import { ModelFormType } from '@app/common/interfaces/model-form.interface';
import { NewModel } from '@app/common/interfaces/new-model.interface';
import {
  Schema,
  SchemaFormType,
} from '@app/common/interfaces/schema.interface';

// here we can create the schema payload

export default function generatePayload(data: SchemaFormType): SchemaFormType {
  const SUOMI_FI_NAMESPACE = 'http://uri.suomi.fi/datamodel/ns/';

  return {
    // id will be pid , during post no id
    id: `${SUOMI_FI_NAMESPACE}${data}`,
    description: data.languages
      .filter((l) => l.description !== '')
      .reduce(
        (obj, l) => ({
          ...obj,
          [l.uniqueItemId]: l.description,
        }),
        {}
      ),
    label: data.languages
      .filter((l) => l.title !== '')
      .reduce(
        (obj, l) => ({
          ...obj,
          [l.uniqueItemId]: l.title,
        }),
        {}
      ),
    languages: data.languages
      .filter((l) => l.title !== '')
      .map((l) => l.uniqueItemId),
    organizations: data.organizations.map((o) => o.uniqueItemId),
    status: 'DRAFT',
  };
}
