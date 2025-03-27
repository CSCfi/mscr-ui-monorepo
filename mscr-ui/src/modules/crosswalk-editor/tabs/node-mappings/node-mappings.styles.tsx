import styled from 'styled-components';
import { Modal, ModalContent } from 'suomifi-ui-components';

export const MidColumnWrapper = styled.div`
  min-height: 490px;
  background-color: ${(props) => props.theme.suomifi.colors.highlightLight2};
`;

export const StyledModal = styled(Modal)`
  background-color: ${(props) => props.theme.suomifi.colors.whiteBase};
  && {
    width: 1000px;
  }
`;

export const StyledModalContent = styled(ModalContent)`
  font-size: 0.9rem;
  && {
    padding: 30px 30px 30px 30px;
    height: 600px;
  }
  th {
    background-color: ${(props) => props.theme.suomifi.colors.highlightLight2};
  }
`;
