import { useTranslation } from 'next-i18next';
import { Property } from '@app/common/interfaces/termed-data-types.interface';
import CheckboxFilter from './checkbox-filter';
import useUrlState, {
  initialUrlState,
} from '@app/common/utils/hooks/use-url-state';

export interface InformationDomain {
  id: string;
  name: Property;
}

export interface InformationDomainFilterProps {
  domains: InformationDomain[];
  title: string;
  isModal?: boolean;
  counts: { [key: string]: number };
}

export default function InformationDomainFilter({
  title,
  isModal,
  domains,
  counts,
}: InformationDomainFilterProps) {
  const { t } = useTranslation('common');
  const { urlState, patchUrlState } = useUrlState();

  return (
    <CheckboxFilter
      title={title}
      items={domains.map(({ id, name }) => ({
        value: id,
        label: (
          <>
            {name.value} ({counts[id] ?? 0} {t('vocabulary-filter-items')})
          </>
        ),
      }))}
      selectedItems={urlState.domain}
      onChange={(domain) =>
        patchUrlState({
          domain,
          page: initialUrlState.page,
        })
      }
      checkboxVariant={isModal ? 'large' : 'small'}
    />
  );
}