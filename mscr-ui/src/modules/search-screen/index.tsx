import { Container } from '@mui/system';
import { SearchScreenWrapper } from './search-screen.styles';
import { useBreakpoints } from 'yti-common-ui/media-query';
import { useState, useContext } from 'react';
import { SearchContext } from '@app/pages/[homepage]';
import { Button } from 'suomifi-ui-components';
import SearchFilterBar from '@app/common/components/search-filter-bar';

// export default function SearchScreen(toggleDisplayFunction: () => {}) {
export default function SearchScreen() {
  const { breakpoint } = useBreakpoints();

  const { isSearchScreenVisible, setSearchScreenVisible } =
    useContext(SearchContext);

  const toggleVisibility = () => {
    setSearchScreenVisible(!isSearchScreenVisible);
  };

  return (
    <SearchScreenWrapper $breakpoint={breakpoint}>
      <Button
        style={{
          top: '0px',
          right: '0px',
          position: 'absolute',
          //   display: 'flex',
          //   flexDirection: 'row-reverse',
        }}
        onClick={toggleVisibility}
      >
        toggle visibility
      </Button>
      <SearchFilterBar />
      <div></div>
    </SearchScreenWrapper>
  );
}
