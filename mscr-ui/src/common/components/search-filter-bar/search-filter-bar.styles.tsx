import styled from 'styled-components';
import { Breakpoint } from 'yti-common-ui/media-query';

export const SearchFilterBarWrapper = styled.aside<{ $breakpoint: Breakpoint }>`
  width: 15%;
  height: 100vh;
  background: red;
  //   position: absolute;
  // display: none;
`;
