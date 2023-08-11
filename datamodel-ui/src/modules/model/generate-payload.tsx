import { ModelFormType } from '@app/common/interfaces/model-form.interface';
import {
  ModelType,
  ModelUpdatePayload,
} from '@app/common/interfaces/model.interface';
import { ADMIN_EMAIL } from '@app/common/utils/get-value';

export default function generatePayload(
  data: ModelFormType | ModelType
): ModelUpdatePayload {
  if ('description' in data) {
    return {
      status: data.status ?? 'DRAFT',
      label: data.label,
      description: data.description,
      languages: data.languages,
      organizations: data.organizations.map((o) => o.id) ?? [],
      groups: data.groups.map((g) => g.identifier) ?? [],
      internalNamespaces: data.internalNamespaces,
      externalNamespaces: data.externalNamespaces,
      terminologies: data.terminologies.map((t) => t.uri) ?? [],
      codeLists: data.codeLists.map((c) => c.id) ?? [],
      documentation: data.documentation ?? {},
      contact: data.contact !== '' ? data.contact : '',
    };
  } else {
    return {
      status: data.status ?? 'DRAFT',
      label: data.languages
        .filter((l) => l.selected)
        .reduce(
          (obj, l) => ({
            ...obj,
            [l.uniqueItemId]: l.title,
          }),
          {}
        ),
      description: data.languages
        .filter((l) => l.selected && l.description && l.description !== '')
        .reduce(
          (obj, l) => ({
            ...obj,
            [l.uniqueItemId]: l.description,
          }),
          {}
        ),
      languages: data.languages
        .filter((l) => l.selected)
        .map((l) => l.uniqueItemId),
      organizations: data.organizations.map((o) => o.uniqueItemId),
      groups: data.serviceCategories.map((s) => s.uniqueItemId),
      internalNamespaces: data.internalNamespaces,
      externalNamespaces: data.externalNamespaces,
      terminologies: data.terminologies.map((t) => t.uri),
      codeLists: data.codeLists.map((c) => c.id),
      documentation: data.documentation ?? {},
      contact: data.contact !== '' ? data.contact : ADMIN_EMAIL,
    };
  }
}
