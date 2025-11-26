import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { Heading, Link, Text } from 'suomifi-ui-components';


const StyledHeading = styled(Heading)`
  margin-bottom: 20px;
`;

const StyledText = styled(Text)`
  display: block;
  margin-bottom: 10px;
`;

const StyledList = styled.ul`
  margin-top: 15px;
  padding-left: 30px;
`;

export default function SiteInformationModule() {
  const { t } = useTranslation('common');


  return (
    <>
      <StyledHeading variant="h2" >{t('landing.title')}</StyledHeading>
      <StyledText variant="lead">{t('landing.description')}</StyledText>
      <Heading variant="h3">{t('landing.what-can-do')}</Heading>
      <StyledList>
        <li>
          <Text>{t('landing.bullet-1')}</Text>
        </li>
        <li>
          <Text>{t('landing.bullet-2')}</Text>
        </li>
        {/*<li><Text>{t('landing.bullet-3')}</l</Text>i>*/}
        {/*<li><Text>{t('landing.bullet-4')}</l</Text>i>*/}
        <li>
          <Text>{t('landing.bullet-5')}</Text>
        </li>
        <li>
          <Text>{t('landing.bullet-6')}</Text>
        </li>
      </StyledList>
      
      <Heading variant="h3" style={{ marginTop: '10px' }}>MSCR Demo Video</Heading>
      <Text>
        Take a look at this short demo video to see how MSCR works.
      </Text>
    
      {/* privacy-enhanced embed (no external script load) */}
      <div style={{ marginTop: '10px' }}>
        <iframe
          width="100%"
          height="200"
          src="https://www.youtube-nocookie.com/embed/RS41HavJcnw?si=3-TAbWHydmr-szaK"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
      <Text style={{ marginTop: '20px' }}>
        {t('privacy-text.1')}{' '}
        <Link href="privacy-guideline">{t('privacy-link')}</Link>{' '}
        {t('privacy-text.2')}
      </Text>
    </>
  );
}
