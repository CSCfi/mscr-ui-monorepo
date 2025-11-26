import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { Heading, Link, Text } from 'suomifi-ui-components';
import YouTube, { YouTubeProps } from 'react-youtube';
import Separator from 'yti-common-ui/separator';

const StyledHeading = styled(Heading)`
  margin-bottom: 30px;
`;

const StyledText = styled(Text)`
  display: block;
  margin-bottom: 30px;
`;

const StyledList = styled.ul`
  margin-top: 15px;
  padding-left: 30px;
`;

export default function SiteInformationModule() {
  const { t } = useTranslation('common');


  function Example() {
   return (
    <iframe src="https://www.youtube.com/embed/RS41HavJcnw?si=L-4UTfqkTF7It_Hr" allowFullScreen />
  )
}

  return (
    <>
      <StyledHeading variant="h1">{t('landing.title')}</StyledHeading>
      <StyledText variant="lead">{t('landing.description')}</StyledText>
      <Heading variant="h2">{t('landing.what-can-do')}</Heading>
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
      <Text>
        {t('privacy-text.1')}{' '}
        <Link href="privacy-guideline">{t('privacy-link')}</Link>{' '}
        {t('privacy-text.2')}
      </Text>
      <h1>MSCR Demo Video</h1>
      <Text>
        Take a look at this short demo video to see how MSCR works in practice.
      </Text>
      
      
      {/* privacy-enhanced embed (no external script load) */}
      <div style={{ maxWidth: 640, marginTop: '20px' }}>
        <iframe
          title="MSCR Demo Video"
          width="100%"
          height="240"
          src="https://www.youtube-nocookie.com/embed/RS41HavJcnw"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      
    </>
  );
}



