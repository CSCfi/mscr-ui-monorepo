import styled from 'styled-components';
import { Heading } from 'suomifi-ui-components';

export const MappingsHeading = styled(Heading)`
  && {
    font-size: 1.2rem;
  }
  color: ${(props) => props.theme.suomifi.colors.depthDark2};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
