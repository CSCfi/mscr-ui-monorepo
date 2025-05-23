import { ExternalLink, Link, Paragraph, Text } from 'suomifi-ui-components';
import {
  FooterContentWrapper,
  FooterLink,
  FooterLinkWrapper,
  VersionInfo,
} from './footer.styles';
import { useBreakpoints } from 'yti-common-ui/media-query';
import { TFunction } from 'next-i18next';
import Image from 'next/image';
import { MarginContainer } from '../layout/layout.styles';
import { Grid } from 'react-loader-spinner';

export interface FooterProps {
  t: TFunction;
  versionInfo?: string;
}

export default function Footer({
  t,

  versionInfo,
}: FooterProps) {
  const { breakpoint } = useBreakpoints();

  return (
    <>
      <FooterContentWrapper>
        <MarginContainer $breakpoint={breakpoint}>
          <Paragraph>
            <Text >Metadata Schema and Crosswalk Registry Version 1.0.0</Text>
          </Paragraph>

          <FooterLink href="https://cscfi.github.io/mscr-docs/privacy-guideline/" target="_blank">{t('privacy-link')}</FooterLink>
          <FooterLink href="https://cscfi.github.io/mscr-docs/terms-of-use/" target="_blank">Terms of use</FooterLink>
          <FooterLink href="https://cscfi.github.io/mscr-docs/acceptable-use-policy/" target="_blank">Acceptable Usuage Policy</FooterLink>      
          <FooterLink href="https://cscfi.github.io/mscr-docs/" target="_blank">Documentation</FooterLink>
          <FooterLink href="https://github.com/orgs/CSCfi/teams/mscr/repositories" target="_blank">Code Repository</FooterLink>
        </MarginContainer>
      </FooterContentWrapper>
         
    </>
  );
}
