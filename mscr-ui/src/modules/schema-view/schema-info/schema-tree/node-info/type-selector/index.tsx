import {
  HeadingAndCountWrapper,
  InstructionParagraph,
  ResultButton,
  TypeInfoWrapper,
  TypeSearchResultWrapper,
  TypeSelectorWrapper,
} from '@app/modules/schema-view/schema-info/schema-tree/node-info/type-selector/type-selector.styles';
import {
  Heading,
  Pagination,
  Paragraph,
  RouterLink,
  SearchInput,
} from 'suomifi-ui-components';
import { IconLinkExternal } from 'suomifi-icons';
import { useTranslation } from 'next-i18next';
import {
  selectHitCount,
  selectPage,
  selectPageSize,
  selectQuery,
  selectResults,
  setHitCount,
  setPage,
  setQuery,
  setResults,
  useGetTypesSearchResultsQuery,
} from '@app/common/components/data-type/data-type.slice';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Tooltip from '@mui/material/Tooltip';
import { useStoreDispatch } from '@app/store';
import { useSelector } from 'react-redux';

export default function TypeSelector({ target }: { target?: string }) {
  // Todo: What if target is undefined when you need to make internal change type api call?
  const { t } = useTranslation('common');
  const dispatch = useStoreDispatch();
  const results = useSelector(selectResults());
  const [skip, setSkip] = useState(true);
  const query = useSelector(selectQuery());
  const hitCount = useSelector(selectHitCount());
  const currentPage = useSelector(selectPage());
  const pageSize = useSelector(selectPageSize());
  const { query: queryRoute } = useRouter();
  const schemaId = (queryRoute?.pid ?? [''])[0];
  const { data, isSuccess } = useGetTypesSearchResultsQuery(
    { query, page: currentPage, pageSize },
    { skip }
  );
  const lastPage = hitCount ? Math.ceil(hitCount / pageSize) : 0;

  useEffect(() => {
    if (isSuccess) {
      dispatch(setResults(data.hits.map((hit) => hit.document)));
      dispatch(setHitCount(data.found));
    }
  }, [data, dispatch, isSuccess]);

  const handleInputChange = (value: string) => {
    dispatch(setPage(1));
    if (value.length < 1) {
      setSkip(true);
      dispatch(setResults([]));
      dispatch(setQuery(value));
      dispatch(setHitCount(0));
      return;
    }
    dispatch(setQuery(value));
    setSkip(false);
  };
  // console.log('searching with: ',  query, ' and returning', data);
  // data?.hits.map((hit) => {
  //   console.log(hit);
  // });
  // console.log('API would be called with {schemaId: ', schemaId, ',  target: ', target);

  function dataTypeSearchResult(id: string, name: string, description: string) {
    return (
      <TypeSearchResultWrapper key={id}>
        <TypeInfoWrapper>
          <Heading variant={'h5'}>{name}</Heading>
          <Paragraph>{description}</Paragraph>
        </TypeInfoWrapper>
        <ResultButton variant={'secondaryNoBorder'}>
          {t('node-info.use-button')}
        </ResultButton>
        <Tooltip
          title={t('node-info.link-to-type-registry')}
          placement="top-end"
          className={undefined}
        >
          <RouterLink href={'https://hdl.handle.net/' + id}>
            <IconLinkExternal />
          </RouterLink>
        </Tooltip>
      </TypeSearchResultWrapper>
    );
  }

  return (
    <TypeSelectorWrapper>
      <SearchInput
        labelText={t('node-info.type-search')}
        clearButtonLabel={t('node-info.clear-search-label')}
        searchButtonLabel={t('node-info.search-label')}
        labelMode={'hidden'}
        visualPlaceholder={t('node-info.type-to-search')}
        value={query}
        onChange={(value) => handleInputChange(value as string)}
        aria-controls={'results'}
      />
      <HeadingAndCountWrapper>
        <Heading id={'results-label'} variant={'h4'}>
          {t('node-info.type-search-results-title')}
        </Heading>
        <Paragraph aria-live={'polite'}>{t('node-info.found-results', { hitCount })}</Paragraph>
      </HeadingAndCountWrapper>

      <div id={'results'} aria-labelledby={'results-label'}>
        {results &&
          results.length > 0 &&
          results.map((result) =>
            dataTypeSearchResult(result.id, result.name, result.description)
          )}
        {query.length === 0 && (
          <InstructionParagraph>
            {t('node-info.make-query-and-choose')}
          </InstructionParagraph>
        )}
      </div>

      {hitCount > pageSize && (
        <Pagination
          aria-label={t('pagination.aria.label')}
          pageIndicatorText={(currentPage, lastPage) =>
            t('pagination.page') + ' ' + currentPage + ' / ' + lastPage
          }
          ariaPageIndicatorText={(currentPage, lastPage) =>
            t('pagination.aria.info', { currentPage, lastPage })
          }
          lastPage={lastPage}
          currentPage={currentPage}
          onChange={(e) => dispatch(setPage(+e))}
          nextButtonAriaLabel={t('pagination.aria.next')}
          previousButtonAriaLabel={t('pagination.aria.prev')}
          pageInput={false}
        />
      )}
    </TypeSelectorWrapper>
  );
}
