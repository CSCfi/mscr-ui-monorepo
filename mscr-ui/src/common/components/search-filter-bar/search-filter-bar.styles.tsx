import styled from 'styled-components';
import { Breakpoint } from 'yti-common-ui/media-query';

export const SearchFilterBarWrapper = styled.aside<{ $breakpoint: Breakpoint }>`
  width: 20%;
  height: 100vh;
  border-right: solid;
  //   position: absolute;
  display: flex;
  flex-direction: column;
`;
