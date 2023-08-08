import styled from 'styled-components';
import { Breakpoint } from 'yti-common-ui/media-query';

export const SearchResultElementWrapper = styled.aside<{
  $breakpoint: Breakpoint;
}>`
  // flex-grow: 1;
  //   width: 100%;

  display: flex;
  margin: 20px;
  padding: ${(props) => props.theme.suomifi.spacing.m};
`;
