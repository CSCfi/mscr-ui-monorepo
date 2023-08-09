import { SearchFilterBarWrapper } from './search-filter-bar.styles';
import { useBreakpoints } from 'yti-common-ui/media-query';
import { Heading } from 'suomifi-ui-components';

export default function SearchFilterBar({ searchResults }) {
  const { breakpoint } = useBreakpoints();

  console.log(
    'LOGGING ! \n' +
      JSON.stringify(searchResults.aggregations.languages.buckets[0].key) +
      Array.isArray(searchResults.aggregations.languages.buckets)
    //   searchResults.hits
  );

  return (
    <SearchFilterBarWrapper $breakpoint={breakpoint}>
      {searchResults &&
        searchResults.aggregations.languages.buckets.map((b) => (
          <SearchFacetElement key={b.key} keyN={b.key} count={b.doc_count} />
        ))}
    </SearchFilterBarWrapper>
  );
}

// props.searchResults.aggregations.languages.buckets.map( b => b.key and b.doc_count)

const SearchFacetElement = ({
  keyN,
  count,
}: {
  keyN: string;
  count: string;
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', margin: '50px' }}>
      <Heading style={{ margin: '10px' }} variant="h3">
        {keyN + ' '}
      </Heading>
      <Heading style={{ margin: '10px' }} variant="h3">
        {count}
      </Heading>
    </div>
  );
};
