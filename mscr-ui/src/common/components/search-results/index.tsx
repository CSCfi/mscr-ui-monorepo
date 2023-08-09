import { Container } from '@mui/material';
import { Block, Heading } from 'suomifi-ui-components';
import { useBreakpoints } from 'yti-common-ui/media-query';
import {
  SearchResultElementWrapper,
  SearchResultsWrapper,
} from './search-results.styles';

export default function SearchResults({ searchResults }) {
  const { breakpoint } = useBreakpoints();
  return (
    <SearchResultsWrapper $breakpoint={breakpoint}>
      {searchResults &&
        searchResults.hits.hits.map((hit) => (
          <SearchResultElement
            title={hit._source.label.en}
            description={hit._source.comment.en}
            iconType={hit._source.type}
          />
        ))}
    </SearchResultsWrapper>
  );
}

const SearchResultElement = ({
  title,
  description,
  iconType,
}: {
  title: string;
  description: string;
  iconType: string;
}) => {
  const icon = iconType === 'SCHEMA' ? 'S' : 'C';

  const { breakpoint } = useBreakpoints();

  const styles = {
    labelStyle: {
      border: '1px',
      borderRadius: '50px',
      padding: '5px',
      marginRight: '10px',
      alignItems: 'left',
      backgroundColor: '#D3D3D3',
    },
  };

  return (
    <SearchResultElementWrapper $breakpoint={breakpoint}>
      <Block>
        <div
          style={{
            display: 'flex',
          }}
        >
          <Heading variant="h1">{icon}</Heading>
          <Heading
            variant="h2"
            style={{ alignSelf: 'center', marginLeft: '20px' }}
          >
            Name: {title}
          </Heading>
        </div>
        <p>Description: {description}</p>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={styles.labelStyle}> some label </div>
          <div style={styles.labelStyle}> other label </div>
        </div>
      </Block>
    </SearchResultElementWrapper>
  );
};
