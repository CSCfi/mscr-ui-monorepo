import styled from 'styled-components';
import { Block, Heading } from 'suomifi-ui-components';

export const MappingsHeading = styled(Heading)`
  && {
    font-size: 1.2rem;
  }
  color: ${(props) => props.theme.suomifi.colors.depthDark2};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MappingListWrapper = styled(Block)`
  overflow-y: auto;
  height: calc(100vh - 250px);
  padding: 8px;
  border: 1px solid ${(props) => props.theme.suomifi.colors.highlightBase};
  background-color: ${(props) => props.theme.suomifi.colors.highlightLight3};
  svg {
    margin: 0 16px;
  }
  & > span {
    position: relative;
    bottom: 4px;
  }
`;
