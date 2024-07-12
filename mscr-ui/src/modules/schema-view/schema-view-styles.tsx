import styled from 'styled-components';
import { Heading } from 'suomifi-ui-components';

export const VersionsHeading = styled(Heading)`
  && {
    font-size: 1.2rem;
    margin-top: 1rem;
    margin-left: 15px;
  }
  color: ${(props) => props.theme.suomifi.colors.depthDark2};
`;
