import { useTranslation } from 'next-i18next';
import { SiteTitle } from '../site-information/site-information.styles';
import { Grid } from '@mui/material';
import { Margin } from '@mui/icons-material';
import Separator from 'yti-common-ui/separator';
import { StyledTableContainer } from '@app/common/components/generic-table/generic-table.styles';
import { Paragraph } from 'suomifi-ui-components';

export default function PrivacyGuide() {
  const { t } = useTranslation('common');

  return (
    <>
      <SiteTitle variant="h1">Privacy Guidelines for MSCR</SiteTitle>
          <Paragraph>Effective as of Date 15.3.2025 </Paragraph>
          <br></br>
      <StyledTableContainer>
        <Grid container rowSpacing={4} columnSpacing={4}>
          <Grid item xs={4}>
            {t('controller.label')}
          </Grid>
          <Grid item xs={8}>
            {t('controller.description.1')}
            <br />
            {t('controller.description.2')}
            <br />
            {t('controller.description.3')}
            <br />
            {t('controller.description.4')}
            <br />
            {t('controller.description.5')}
            <br />
            {t('controller.description.6')}
            <br />
            {t('controller.description.7')}
            <br />
            {t('controller.description.8')}
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('contact.label')}
          </Grid>
          <Grid item xs={8}>
            {t('contact.description.1')}
            <br />
            {t('contact.description.2')}
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('ground.title')}
          </Grid>
          <Grid item xs={8}>
            {t('ground.description')}
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('purpose.title')}
          </Grid>
          <Grid item xs={8}>
            {t('purpose.description.1')}

            <ul>
              <li> {t('purpose.description.2')}</li>
              <li> {t('purpose.description.3')}</li>
              <li> {t('purpose.description.4')}</li>
            </ul>
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('automated-decision.title')}
          </Grid>
          <Grid item xs={8}>
            {t('automated-decision.description.1')}
            <br />
            {t('automated-decision.description.2')}
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('what-we-process.title')}
          </Grid>
          <Grid item xs={8}>
            {t('what-we-process.description.1')}
            <br />
            <ul>
              <li>{t('what-we-process.description.2')}</li>
              <li> {t('what-we-process.description.3')}</li>
              <li>{t('what-we-process.description.4')}</li>
            </ul>
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('data-source.title')}
          </Grid>
          <Grid item xs={8}>
            {t('data-source.description')}
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('data-disclose.title')}
          </Grid>
          <Grid item xs={8}>
            {t('data-disclose.description')}
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('outside-eea.title')}
          </Grid>
          <Grid item xs={8}>
            {t('outside-eea.description')}
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('data-persistense.title')}
          </Grid>
          <Grid item xs={8}>
            {t('data-persistense.description.6')}
            <ul>
              <li> {t('data-persistense.description.1')}</li>
              <li> {t('data-persistense.description.2')}</li>
              <li> {t('data-persistense.description.3')}</li>
              <li>{t('data-persistense.description.5')}</li>
            </ul>
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('protect-data.title')}
          </Grid>
          <Grid item xs={8}>
            {t('protect-data.description.1')}
            <br />
            {t('protect-data.description.2')}
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('data-subject-right.title')}
          </Grid>
          <Grid item xs={8}>
            {t('data-subject-right.description.1')}
            <ul>
              <li>{t('data-subject-right.description.2')}</li>
              <li>{t('data-subject-right.description.3')}</li>
              <li>{t('data-subject-right.description.4')}</li>
              <li>{t('data-subject-right.description.5')}</li>
              <li>{t('data-subject-right.description.6')}</li>
              <li>{t('data-subject-right.description.7')}</li>
            </ul>
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('contact-person.title')}
          </Grid>
          <Grid item xs={8}>
            {t('contact-person.description')}
          </Grid>
          <Separator isLarge={true}></Separator>
          <Grid item xs={4}>
            {t('change-in-policy.title')}
          </Grid>
          <Grid item xs={8}>
            {t('change-in-policy.description')}
          </Grid>
        </Grid>
      </StyledTableContainer>
    </>
  );
}
