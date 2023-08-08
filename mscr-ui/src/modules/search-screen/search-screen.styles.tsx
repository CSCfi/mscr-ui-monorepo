import styled from 'styled-components';
import { Breakpoint } from 'yti-common-ui/media-query';

export const SearchScreenWrapper = styled.aside<{ $breakpoint: Breakpoint }>`
  width: 100%;
  height: 100vh;
  // background: green;
  // flex: 1;
  // width: 90vw;
  // margin-left: 50%;
  // transform: translateX(-50%);
  position: relative;
  display: flex;
  // display: none;
`;
