import { Type } from '@app/common/interfaces/search.interface';
import { useTranslation } from 'next-i18next';
import { useBreakpoints } from 'yti-common-ui/components/media-query';
import WorkspaceTable, {
  ContentRow,
} from '@app/modules/workspace/workspace-table';
import Title from 'yti-common-ui/components/title';
import {
  Description,
  TitleDescriptionWrapper,
} from 'yti-common-ui/components/title/title.styles';
import Separator from 'yti-common-ui/components/separator';
import { MscrUser } from '@app/common/interfaces/mscr-user.interface';
import Pagination from '@app/common/components/pagination';
import { ButtonBlock } from '../workspace.styles';
import useUrlState from '@app/common/utils/hooks/use-url-state';
import {
  mscrSearchApi,
  useGetOrgContentQuery,
} from '@app/common/components/mscr-search/mscr-search.slice';
import { useStoreDispatch } from '@app/store';
import { useEffect, useMemo, useState } from 'react';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import { useRouter } from 'next/router';
import { ModalVisibilityButton } from '@app/modules/form/modal-visibility-button';
import FormModal, { ModalType } from '@app/modules/form';
import Link from 'next/link';

interface GroupHomeProps {
  user: MscrUser;
  pid: string;
  contentType: Type;
}
export default function GroupWorkspace({
  user,
  pid,
  contentType,
}: GroupHomeProps) {
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
  const { data, isLoading } = useGetOrgContentQuery({
    type: contentType,
    pageSize,
    urlState,
    ownerOrg: pid,
  });
  const lastPage = data?.hits.total?.value
    ? Math.ceil(data?.hits.total.value / pageSize)
    : 0;

  // Todo: Refactor workspaces to share code to avoid repeated code
  const fetchedContent = useMemo(() => {
    if (data) {
      return data.hits.hits.map((result) => {
        const info = result._source;
        const label = getLanguageVersion({
          data: info.label,
          lang,
        });
        const linkUrl =
          contentType == Type.Schema
            ? router.basePath + '/schema/' + info.id
            : router.basePath + '/crosswalk/' + info.id;
        const linkLabel = `${t('workspace.view')} ${label}`;
        return {
          label: label,
          /* ...(contentType == Type.Schema && { namespace: info.namespace }), */
          state: info.state,
          numberOfRevisions: info.numberOfRevisions.toString(),
          pid: info.handle ?? t('metadata.not-available'),
          format: info.format,
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          linkUrl: <Link href={linkUrl} passHref><a aria-label={linkLabel}>{t('workspace.view')}</a></Link>,        };
      });
    } else {
      return [];
    }
  }, [contentType, data, lang, router.basePath, t]);

  useEffect(() => {
    setContent(fetchedContent);
  }, [fetchedContent]);

  const refetchInfo = () => {
    setTimeout(
      () =>
        dispatch(
          mscrSearchApi.util.invalidateTags(['OrgContent', 'MscrSearch'])
        ),
      300
    );
  };

  if (isLoading) {
    return <div> Is Loading </div>; //ToDo: A loading circle or somesuch
  } else if (!user || user.anonymous || !user.rolesInOrganizations[pid]) {
    return <div> You do not have rights to view this page </div>;
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
        <Separator isLarge />
        <div>
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
                  organizationPid={pid}
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
                  organizationPid={pid}
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
                  organizationPid={pid}
                />
              </>
            )}
          </ButtonBlock>
        </div>
        <Separator isLarge />
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
