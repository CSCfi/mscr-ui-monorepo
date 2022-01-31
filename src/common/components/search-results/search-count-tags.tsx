import { useTranslation } from 'react-i18next';
import { Chip } from 'suomifi-ui-components';
import { AppThunk, useStoreDispatch } from '../../../store';
import useQueryParam from '../../utils/hooks/useQueryParam';
import { useBreakpoints } from '../media-query/media-query-context';
import { SearchState } from '../terminology-search/terminology-search-slice';
import { VocabularyState } from '../vocabulary/vocabulary-slice';
import {
  ChipWrapper,
  CountText,
  CountWrapper
} from './search-count-tags.styles';

interface SearchCountTagsProps {
  count: number;
  filter: VocabularyState['filter'] | SearchState['filter'];
  setFilter: (x: any) => AppThunk;
}

export default function SearchCountTags({ count, filter, setFilter }: SearchCountTagsProps) {
  const { t } = useTranslation('common');
  const [keyword, updateKeyword] = useQueryParam('q');

  const { isSmall } = useBreakpoints();

  const dispatch = useStoreDispatch();
  let activeStatuses: string[] = [];;

  if ('showByOrg' in filter && filter.showByOrg.value) {
    activeStatuses.push(filter.showByOrg.value);

    if (keyword) {
      activeStatuses.push(keyword);
    }

    Object.keys(filter.status).map(key => {
      if (filter.status[key] === true) {
        activeStatuses.push(key);
      }
    });
  } else {
    Object.keys(filter.status).map(key => {
      if (filter.status[key] === true) {
        activeStatuses.push(key);
      }
    });

    if (keyword) {
      activeStatuses.push(keyword);
    }
  }

  if ('infoDomains' in filter && 'infoDomains' in filter) {
    filter.infoDomains.map(infoDomain => {
      activeStatuses.push(infoDomain.value);
    });
  }

  const handleTagClose = (s: string) => {
    let retVal: SearchCountTagsProps['filter'] = filter;

    if (Object.keys(filter.status).includes(s)) {
      retVal = { ...filter, status: { ...filter.status, [s]: false } };
    } else if ('infoDomains' in filter && filter.infoDomains.find(id => id.value === s)) {
      retVal = { ...filter, infoDomains: filter.infoDomains.filter(id => id.value !== s) };
    } else if ('showByOrg' in filter && filter.showByOrg.value !== '') {
      retVal = { ...filter, showByOrg: {id: '', value: ''} };
    } else {
      updateKeyword();
    }

    dispatch(setFilter(retVal));
  };

  return (
    <CountWrapper isSmall={isSmall} border={'showByOrg' in filter}>
      <CountText>
        {'showByOrg' in filter
          ?
          <>{t('terminology-search-terminologies')} {count} {t('vocabulary-results-with-following-filters')}</>
          :
          ('showBy' in filter && filter.showBy === 'collections')
            ?
            <>{t('vocabulary-results-collections')} {count} {t('vocabulary-filter-items')}</>
            :
            <>{t('vocabulary-results-concepts')} {count} {t('vocabulary-results-with-following-filters')}</>
        }
      </CountText>
      <ChipWrapper>
        {activeStatuses.map((status: string, idx: number) => {
          return (
            <Chip
              actionLabel={`Remove filter ${status}`}
              key={idx}
              onClick={() => handleTagClose(status)}
              removable
            >
              {t(status)}
            </Chip>
          );
        })}
      </ChipWrapper >
    </CountWrapper >
  );
}