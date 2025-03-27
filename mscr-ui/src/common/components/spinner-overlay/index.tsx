import { RotatingLines } from 'react-loader-spinner';
import { StyledOverlay } from '@app/common/components/spinner-overlay/spinner-overlay.styles';
import { defaultSuomifiTheme } from 'suomifi-ui-components';
import { useTranslation } from 'next-i18next';
import { useBreakpoints } from 'yti-common-ui/components/media-query';

export const delay = async (ms: number | undefined) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function SpinnerOverlay({
  animationVisible,
  transparentBackground
}: {
  animationVisible: boolean;
  transparentBackground?: boolean;
}) {
  const { t } = useTranslation('common');
  const { breakpoint } = useBreakpoints();

  if (!animationVisible) return <></>;

  return (
    <StyledOverlay $breakpoint={breakpoint} $transparentBackground={transparentBackground ?? false}>
      <RotatingLines
        width="190"
        strokeColor={defaultSuomifiTheme.colors.highlightBase}
        strokeWidth="4"
        animationDuration="1"
        ariaLabel={t('loading-circle-label')}
      />
    </StyledOverlay>
  );
}
