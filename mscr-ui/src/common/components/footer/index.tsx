import {  Paragraph, Text } from 'suomifi-ui-components';
import {
  FooterContentWrapper,
  FooterLink,
} from './footer.styles';
import { useBreakpoints } from 'yti-common-ui/media-query';
import { TFunction } from 'next-i18next';
import Image from 'next/image';
import { MarginContainer } from '../layout/layout.styles';
import { Grid } from '@mui/material';

export interface FooterProps {
  t: TFunction;
  versionInfo?: string;
}

export default function Footer({
  t,versionInfo,
}: FooterProps) {
  const { breakpoint } = useBreakpoints();

  return (
    <>
      <FooterContentWrapper>
        <MarginContainer $breakpoint={breakpoint}>
      
          <Grid container rowSpacing={2} columnSpacing={4}>
            <Grid item xs={11}>
              <Paragraph>
            <Text >Metadata Schema and Crosswalk Registry Version 1.0.0</Text>
          </Paragraph>

          <FooterLink href="https://cscfi.github.io/mscr-docs/privacy-guideline/" target="_blank">{t('privacy-link')}</FooterLink>
          <FooterLink href="https://cscfi.github.io/mscr-docs/terms-of-use/" target="_blank">Terms of use</FooterLink>
          <FooterLink href="https://cscfi.github.io/mscr-docs/acceptable-use-policy/" target="_blank">Acceptable Usuage Policy</FooterLink>      
          <FooterLink href="https://cscfi.github.io/mscr-docs/" target="_blank">Documentation</FooterLink>
          <FooterLink href="https://github.com/orgs/CSCfi/teams/mscr/repositories" target="_blank">Code Repository</FooterLink>
      
          </Grid>
          <Grid item xs={1} justify="flex-end" display="flex" alignItems="end">
             <Image
                    className="logo-image"
                    src="/funded-by-EU.png"
                    width="100"
                    height="50"
                    alt={'FAIRCORE4EOSC'}
                  />
            </Grid>
          </Grid>
           


          
          
        </MarginContainer>
         
      </FooterContentWrapper>
         
    </>
  );
}
