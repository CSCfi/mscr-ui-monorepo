import {
  TypeInfoWrapper,
  TypeSearchResultWrapper,
  TypeSelectorWrapper
} from '@app/modules/schema-view/schema-info/schema-tree/node-info/type-selector/type-selector.styles';
import { Button, Heading, Paragraph, SearchInput } from 'suomifi-ui-components';
import { IconLinkExternal } from 'suomifi-icons';
import { useTranslation } from 'next-i18next';
import {
  useGetTypesCollectionQuery,
  useGetTypesSearchResultsQuery
} from '@app/common/components/data-type/data-type.slice';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function TypeSelector({ target }: {target?: string}) {
  // Todo: What if target is undefined when you need to make internal change type api call?
  const { t } = useTranslation('common');
  const [skip, setSkip] = useState(true);
  const [query, setQuery] = useState('');
  const { query: queryRoute } = useRouter();
  const schemaId = (queryRoute?.pid ?? [''])[0];
  const { data } = useGetTypesSearchResultsQuery(query,{ skip });
  const handleInputChange = (value: string) => {
    if (value.length < 3) {
      setSkip(true);
      setQuery(value);
      return;
    }
    setQuery(value);
    setSkip(false);
  };
  // console.log('searching with: ',  query, ' and returning');
  data?.hits.map((hit) => {
    console.log(hit);
  });
  // console.log('API would be called with {schemaId: ', schemaId, ',  target: ', target);

  function dataTypeSearchResult(id: string, name: string, description: string) {
    return (
      <TypeSearchResultWrapper key={id}>
        <TypeInfoWrapper>
          <Heading variant={'h5'}>{name}</Heading>
          <Paragraph>{description}</Paragraph>
        </TypeInfoWrapper>
        <Button variant={'secondaryNoBorder'}>Use</Button>
        <Button icon={<IconLinkExternal />} variant={'secondaryNoBorder'}>Type Registry</Button>
      </TypeSearchResultWrapper>
    );
  }

  return (
    <TypeSelectorWrapper>
      <SearchInput
        labelText={t('node-info.type-search')}
        clearButtonLabel={t('clear')}
        searchButtonLabel={t('search')}
        labelMode={'hidden'}
        visualPlaceholder={t('node-info.type-to-search')}
        value={query}
        onChange={(value) => handleInputChange(value as string)}
      />
      <Heading variant={'h4'}>{t('node-info.type-search-results-title')}</Heading>
      {data?.hits && data.hits.length > 0 && (
        <>
          {data.hits.map((hit) => {
            const result = hit.document;
            return dataTypeSearchResult(result.id, result.name, result.description);
          })}
        </>
        )
      }
    </TypeSelectorWrapper>
  );
}
