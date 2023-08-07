import { SearchFilterBarWrapper } from './search-filter-bar.styles';
import { useBreakpoints } from 'yti-common-ui/media-query';

export default function SearchFilterBar() {
  const { breakpoint } = useBreakpoints();
  return (
    <SearchFilterBarWrapper $breakpoint={breakpoint}>
      <div></div>
    </SearchFilterBarWrapper>
  );
}
