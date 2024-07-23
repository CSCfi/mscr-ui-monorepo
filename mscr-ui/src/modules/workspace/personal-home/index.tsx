import { Type } from '@app/common/interfaces/search.interface';
import { useTranslation } from 'next-i18next';
import Title from 'yti-common-ui/components/title';
import {
  Description,
  TitleDescriptionWrapper,
} from 'yti-common-ui/components/title/title.styles';
import Separator from 'yti-common-ui/components/separator';
import { useBreakpoints } from 'yti-common-ui/components/media-query';
import { ButtonBlock } from '@app/modules/workspace/workspace.styles';
import Pagination from '@app/common/components/pagination';
import useUrlState from '@app/common/utils/hooks/use-url-state';
import {
  mscrSearchApi,
  useGetPersonalContentQuery,
} from '@app/common/components/mscr-search/mscr-search.slice';
import { useStoreDispatch } from '@app/store';
import { useRouter } from 'next/router';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import { useEffect, useMemo, useState } from 'react';
import WorkspaceTable, {
  ContentRow,
} from '@app/modules/workspace/workspace-table';
import { ModalVisibilityButton } from '@app/modules/form/modal-visibility-button';
import FormModal, { ModalType } from '@app/modules/form';

export default function PersonalWorkspace({
  contentType,
}: {
  contentType: Type;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const lang = router.locale ?? '';
  const { isSmall } = useBreakpoints();
  const { urlState } = useUrlState();
  const dispatch = useStoreDispatch();
  const pageSize = 20;
  const [registerCrosswalkModalVisible, setRegisterCrosswalkModalVisible] =
    useState(false);
  const [createCrosswalkModalVisible, setCreateCrosswalkModalVisible] =
    useState(false);
  const [registerSchemaModalVisible, setRegisterSchemaModalVisible] =
    useState(false);
  const [content, setContent] = useState(new Array<ContentRow>());
  const { data, isLoading } = useGetPersonalContentQuery({
    type: contentType,
    pageSize,
    urlState,
  });
  const lastPage = data?.hits.total?.value
    ? Math.ceil(data?.hits.total.value / pageSize)
    : 0;

  const fetchedContent = useMemo(() => {
    if (data) {
      return data.hits.hits.map((result) => {
        const info = result._source;
        const linkUrl =
          contentType == Type.Schema
            ? router.basePath + '/schema/' + info.id
            : router.basePath + '/crosswalk/' + info.id;
        return {
          label: getLanguageVersion({
            data: info.label,
            lang,
          }),
          ...(contentType == Type.Schema && { namespace: info.namespace }),
          state: info.state,
          numberOfRevisions: info.numberOfRevisions.toString(),
          pid: info.handle ?? t('metadata.not-available'),
          linkUrl: <a href={linkUrl}>{t('workspace.view')}</a>,
        };
      });
    } else {
      return [];
    }
  }, [contentType, data, lang, router.basePath, t]);

  useEffect(() => {
    setContent(fetchedContent);
  }, [fetchedContent]);

  // Need to decide what data we want to fetch loading the application
  const refetchInfo = () => {
    setTimeout(
      () =>
        dispatch(
          mscrSearchApi.util.invalidateTags(['PersonalContent', 'MscrSearch'])
        ),
      300
    );
  };

  if (isLoading) {
    return <div> Is Loading </div>; //ToDo: A loading circle or somesuch
  } else {
    return (
      <main id="main">
        <Title
          title={'Metadata Schema and Crosswalk Registry'}
          noBreadcrumbs={true}
          extra={
            <TitleDescriptionWrapper $isSmall={isSmall}>
              <Description id="page-description">
                {t('service-description')}
              </Description>
            </TitleDescriptionWrapper>
          }
        />
        <ButtonBlock>
          {contentType == 'SCHEMA' ? (
            <>
              <ModalVisibilityButton
                setVisible={setRegisterSchemaModalVisible}
                label={t('content-form.button.schema-register')}
              />
              <FormModal
                modalType={ModalType.RegisterNewFull}
                contentType={Type.Schema}
                visible={registerSchemaModalVisible}
                setVisible={setRegisterSchemaModalVisible}
              />
            </>
          ) : (
            <>
              <ModalVisibilityButton
                setVisible={setRegisterCrosswalkModalVisible}
                label={t('content-form.button.crosswalk-register')}
              />
              <FormModal
                modalType={ModalType.RegisterNewFull}
                contentType={Type.Crosswalk}
                visible={registerCrosswalkModalVisible}
                setVisible={setRegisterCrosswalkModalVisible}
              />
              <ModalVisibilityButton
                setVisible={setCreateCrosswalkModalVisible}
                label={t('content-form.button.crosswalk-create')}
              />
              <FormModal
                modalType={ModalType.RegisterNewMscr}
                contentType={Type.Crosswalk}
                visible={createCrosswalkModalVisible}
                setVisible={setCreateCrosswalkModalVisible}
              />
            </>
          )}
        </ButtonBlock>
        {data?.hits.hits && data?.hits.hits.length < 1 ? (
          <div>
            {contentType == 'SCHEMA'
              ? t('workspace.no-schemas')
              : t('workspace.no-crosswalks')}
          </div>
        ) : (
          <WorkspaceTable content={content} contentType={contentType} />
        )}
        {lastPage > 1 && <Pagination lastPage={lastPage} />}
      </main>
    );
  }
}
