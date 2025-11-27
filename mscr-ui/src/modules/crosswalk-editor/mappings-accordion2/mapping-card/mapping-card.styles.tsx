import styled from 'styled-components';
import { Block, Button, Heading, Text } from 'suomifi-ui-components';

export const MappingWrapper = styled(Block)`
  background-color: ${(props) => props.theme.suomifi.colors.whiteBase};
  padding: 12px;
  margin-top: 8px;
  ol + h3,
  ul + h3,
  span + h3 {
    margin-top: 12px;
  }
`;

export const MappingSubheading = styled(Heading)`
  color: ${(props) => props.theme.suomifi.colors.depthDark2};
  margin-bottom: 12px;
`;

export const NodeList = styled.ol`
  list-style-type: none;
  margin: 0;
`;

export const NodeItem = styled.li``;

export const NodeButton = styled.button`
  background: none;
  color: ${(props) => props.theme.suomifi.colors.highlightBase};
  font-family: ${(props) => props.theme.suomifi.typography.bodyTextSmall};
  border: none;
  cursor: pointer;
  :hover {
    background-color: ${(props) => props.theme.suomifi.colors.highlightLight4};
  }
`;

export const ActionButton = styled(Button)`
  margin: 8px 8px 0 0;
`;

export const FunctionDisplay = styled(Text)`
  padding-left: 24px;
`;

export const FunctionLabel = styled(Text)`
  color: ${(props) => props.theme.suomifi.colors.depthDark1};
  padding-left: 6px;
`;

export const ParamList = styled.ul`
  list-style-type: none;
  display: inline;
  padding-left: 0;
  li {
    display: inline;
    margin-left: 8px;
  }
`;
