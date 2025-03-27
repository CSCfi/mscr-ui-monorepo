import styled from 'styled-components';
import {Block, Button, MultiSelect} from 'suomifi-ui-components';

export const ModelFormContainer = styled(Block)`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.suomifi.spacing.l};

  > hr {
    margin: 0;
  }
`;

export const WideMultiSelect = styled(MultiSelect)`
  min-width: 100%;
`;

export const CloseButton = styled(Button)`
  max-width: 55px;
  position: absolute;
  z-index: 700;
  right: 0;
  &&:hover, &&:focus {
    background: none;
    position: absolute;
  }
`;

