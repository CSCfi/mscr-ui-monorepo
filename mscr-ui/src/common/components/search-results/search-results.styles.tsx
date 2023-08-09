import styled from 'styled-components';
import { Breakpoint } from 'yti-common-ui/media-query';

export const SearchResultElementWrapper = styled.aside<{
  $breakpoint: Breakpoint;
}>`
  border-bottom: 1px solid;
  display: flex;
  margin: 20px;
  padding: ${(props) => props.theme.suomifi.spacing.m};
`;

export const SearchResultsWrapper = styled.aside<{
  $breakpoint: Breakpoint;
}>`
  width: 50%;
  height: 100hw;
  overflow-y: auto;
  padding: ${(props) => props.theme.suomifi.spacing.m};
`;
