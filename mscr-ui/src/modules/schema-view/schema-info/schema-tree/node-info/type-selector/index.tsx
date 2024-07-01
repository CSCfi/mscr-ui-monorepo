import {
  TypeSelectorWrapper
} from '@app/modules/schema-view/schema-info/schema-tree/node-info/type-selector/type-selector.styles';
import { SearchInput } from 'suomifi-ui-components';
import { useTranslation } from 'next-i18next';

export default function TypeSelector() {
  const { t } = useTranslation('common');
  const handleInputChange = (value: string) => {
    if (value.length < 3) return;
    console.log('searching with: ', value);
  };

  return (
    <TypeSelectorWrapper>
      <SearchInput
        labelText={t('node-info.type-search')}
        clearButtonLabel={t('clear')}
        searchButtonLabel={t('search')}
        labelMode={'hidden'}
        visualPlaceholder={t('node-info.type-to-search')}
        onChange={(value) => handleInputChange(value as string)}
      />
    </TypeSelectorWrapper>
  );
}
