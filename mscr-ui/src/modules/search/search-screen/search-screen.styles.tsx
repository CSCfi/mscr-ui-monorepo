import styled from 'styled-components';
import { Block } from 'suomifi-ui-components';

export const SearchContainer = styled(Block)`
  visibility: visible;
  height: 100%;
  position: absolute;
  background-color: ${(props) => props.theme.suomifi.colors.depthLight3};
  z-index: 1;
  width: 100%;
`;

export const FacetsWrapper = styled(Block)`
  // position: absolute;
  padding: 20px 30px 0 30px;
`;

export const ResultsWrapper = styled(Block)`
  // margin-left: 200px;
`;

export const CloseButton = styled.button`
  //position: absolute;
  //top: 85px;
  //right: 5px;
`;
