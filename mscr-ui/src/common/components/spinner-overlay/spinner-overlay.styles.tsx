import styled from 'styled-components';
import { Breakpoint } from 'yti-common-ui/components/media-query';
import { small } from 'yti-common-ui/components/media-query/styled-helpers';

export const StyledOverlay = styled.div<{ $breakpoint: Breakpoint; $transparentBackground: boolean }>`
  display: flex;
  position: absolute;
  justify-content: center;
  background: ${(props) => props.$transparentBackground ? 'transparent' : 'rgba(255, 255, 255, 0.72)'} ;
  z-index: 500;
  top: 0;
  bottom: ${(props) => small(props.$breakpoint, '130px', '80px')};
  width: 100%;
`;
