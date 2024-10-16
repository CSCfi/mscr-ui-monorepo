import {
  selectDisplayLang,
  setHasChanges,
  useGetModelQuery,
} from '@app/common/components/model/model.slice';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  ExternalLink,
  IconOptionsVertical,
  Text,
  Tooltip,
} from 'suomifi-ui-components';
import { BasicBlock, MultilingualBlock } from 'yti-common-ui/block';
import {
  ADMIN_EMAIL,
  getIsPartOfWithId,
  getOrganizationsWithId,
  getUri,
} from '@app/common/utils/get-value';
import { LinksWrapper, TooltipWrapper } from './model.styles';
import { translateLanguage } from '@app/common/utils/translation-helpers';
import { compareLocales } from '@app/common/utils/compare-locals';
import Separator from 'yti-common-ui/separator';
import FormattedDate from 'yti-common-ui/formatted-date';
import { ModelFormType } from '@app/common/interfaces/model-form.interface';
import ModelEditView from './model-edit-view';
import AsFileModal from '../as-file-modal';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import StaticHeader from 'yti-common-ui/drawer/static-header';
import DrawerContent from 'yti-common-ui/drawer/drawer-content-wrapper';
import HasPermission from '@app/common/utils/has-permission';
import DeleteModal from '../delete-modal';
import { useStoreDispatch } from '@app/store';
import { getSlugAsString } from '@app/common/utils/parse-slug';
import SanitizedTextContent from 'yti-common-ui/sanitized-text-content';
import { useGetAwayListener } from '@app/common/utils/hooks/use-get-away-listener';
import useSetView from '@app/common/utils/hooks/use-set-view';
import { v4 } from 'uuid';
import CreateReleaseModal from '../create-release-modal';
import PriorVersions from './prior-versions';
import { useSelector } from 'react-redux';

export default function ModelInfoView({
  organizationIds,
}: {
  organizationIds?: string[];
}) {
  const { t, i18n } = useTranslation('common');
  const dispatch = useStoreDispatch();
  const { query } = useRouter();
  const [modelId] = useState(getSlugAsString(query.slug) ?? '');
  const [version] = useState(getSlugAsString(query.ver));
  const [showTooltip, setShowTooltip] = useState(false);
  const [showEditView, setShowEditView] = useState(false);
  const [formData, setFormData] = useState<ModelFormType | undefined>();
  const [headerHeight, setHeaderHeight] = useState(0);
  const displayLang = useSelector(selectDisplayLang());
  const [openModals, setOpenModals] = useState({
    showAsFile: false,
    downloadAsFile: false,
    createRelease: false,
    updateStatuses: false,
    copyModel: false,
    getEmailNotification: false,
    delete: false,
  });
  const ref = useRef<HTMLDivElement>(null);
  const { ref: toolTipRef } = useGetAwayListener(showTooltip, setShowTooltip);
  const { setView } = useSetView();
  const hasPermission = HasPermission({
    actions: ['EDIT_DATA_MODEL'],
    targetOrganization: organizationIds,
  });
  const { data: modelInfo, refetch } = useGetModelQuery({
    modelId: modelId,
    version: version,
  });

  useEffect(() => {
    if (modelInfo) {
      setFormData({
        contact: '',
        languages:
          modelInfo.languages.map((lang) => ({
            labelText: translateLanguage(lang, t),
            uniqueItemId: lang,
            title:
              Object.entries(modelInfo.label).find((t) => t[0] === lang)?.[1] ??
              '',
            description:
              Object.entries(modelInfo.description).find(
                (d) => d[0] === lang
              )?.[1] ?? '',
            selected: true,
          })) ?? [],
        organizations: getOrganizationsWithId(modelInfo, i18n.language) ?? [],
        prefix: modelInfo?.prefix ?? '',
        serviceCategories: getIsPartOfWithId(modelInfo, i18n.language) ?? [],
        status: modelInfo?.status ?? 'DRAFT',
        type: modelInfo?.type ?? 'PROFILE',
        terminologies: modelInfo.terminologies ?? [],
        externalNamespaces: modelInfo.externalNamespaces ?? [],
        internalNamespaces: modelInfo.internalNamespaces ?? [],
        codeLists: modelInfo.codeLists ?? [],
        links: modelInfo.links
          ? modelInfo.links.map((l) => ({ ...l, id: v4().split('-')[0] }))
          : [],
      });
    }
  }, [modelInfo, t, i18n.language]);

  const handleSuccess = () => {
    refetch();
    setShowEditView(false);
  };

  const handleEditViewItemClick = (setItem: (value: boolean) => void) => {
    setItem(true);
    setView('info', 'edit');
    setShowTooltip(false);
  };

  const handleModalChange = (key: keyof typeof openModals, value?: boolean) => {
    const newOpenModals = Object.keys(openModals).reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: curr === key ? (value ? curr == key : false) : false,
      }),
      {} as typeof openModals
    );
    setOpenModals(newOpenModals);
  };

  useEffect(() => {
    if (ref.current) {
      setHeaderHeight(ref.current.clientHeight);
    }
  }, [ref]);

  if (!modelInfo) {
    return <DrawerContent />;
  }

  if (showEditView && formData) {
    return (
      <ModelEditView
        model={modelInfo}
        hide={() => {
          setShowEditView(false);
          dispatch(setHasChanges(false));
        }}
        handleSuccess={handleSuccess}
      />
    );
  }

  return (
    <>
      <StaticHeader ref={ref}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text variant="bold">{t('details')}</Text>
          <div>
            <Button
              variant="secondary"
              onClick={() => setShowTooltip(!showTooltip)}
              iconRight={<IconOptionsVertical />}
              ref={toolTipRef}
              id="actions-button"
            >
              {t('actions')}
            </Button>
            <TooltipWrapper id="actions-tooltip">
              <Tooltip
                ariaCloseButtonLabelText=""
                ariaToggleButtonLabelText=""
                open={showTooltip}
                onCloseButtonClick={() => setShowTooltip(false)}
              >
                {hasPermission && (
                  <>
                    <Button
                      variant="secondaryNoBorder"
                      onClick={() => handleEditViewItemClick(setShowEditView)}
                      disabled={!formData}
                      id="edit-button"
                    >
                      {t('edit', { ns: 'admin' })}
                    </Button>
                    <Button
                      variant="secondaryNoBorder"
                      onClick={() => handleModalChange('createRelease', true)}
                      disabled={!formData}
                      id="create-release-button"
                    >
                      {t('create-release', { ns: 'admin' })}
                    </Button>
                  </>
                )}
                <Button
                  variant="secondaryNoBorder"
                  onClick={() => handleModalChange('showAsFile', true)}
                  id="show-as-file-button"
                >
                  {t('show-as-file')}
                </Button>
                <Button
                  variant="secondaryNoBorder"
                  onClick={() => handleModalChange('downloadAsFile', true)}
                  id="download-as-file-button"
                >
                  {t('download-as-file')}
                </Button>
                {hasPermission && (
                  <>
                    {!version && (
                      <Button
                        variant="secondaryNoBorder"
                        onClick={() =>
                          handleModalChange('updateStatuses', true)
                        }
                        id="update-statuses-button"
                      >
                        {t('update-models-resources-statuses', { ns: 'admin' })}
                      </Button>
                    )}
                    <Button
                      variant="secondaryNoBorder"
                      onClick={() => handleModalChange('copyModel', true)}
                      id="copy-model-button"
                    >
                      {t('create-copy-from-model', { ns: 'admin' })}
                    </Button>
                    <Button
                      variant="secondaryNoBorder"
                      onClick={() =>
                        handleModalChange('getEmailNotification', true)
                      }
                      id="get-email-notification-button"
                    >
                      {t('add-email-subscription')}
                    </Button>
                    {/* TODO No deletion of datamodels in MVP of version history
                    <Separator />
                    <Button
                      variant="secondaryNoBorder"
                      onClick={() => handleModalChange('delete', true)}
                      id="delete-modal-button"
                    >
                      {t('remove', { ns: 'admin' })}
                    </Button>

                    */}
                  </>
                )}
              </Tooltip>
            </TooltipWrapper>
          </div>
        </div>
        {renderModals()}
      </StaticHeader>

      <DrawerContent height={headerHeight}>
        <BasicBlock title={t('name')}>
          <MultilingualBlock
            data={Object.entries(modelInfo.label)
              .sort((a, b) => compareLocales(a[0], b[0]))
              .map((l) => ({ lang: l[0], value: l[1] }))}
          />
        </BasicBlock>
        <BasicBlock title={t('description')}>
          {Object.keys(modelInfo.description).length > 0 ? (
            <MultilingualBlock
              data={Object.entries(modelInfo.description)
                .sort((a, b) => compareLocales(a[0], b[0]))
                .map((d) => ({
                  lang: d[0],
                  value: <SanitizedTextContent text={d[1]} />,
                }))}
            />
          ) : (
            t('not-added')
          )}
        </BasicBlock>
        <BasicBlock title={t('prefix')}>{modelInfo.prefix}</BasicBlock>
        <BasicBlock title={t('model-uri')}>{getUri(modelInfo)}</BasicBlock>
        <BasicBlock title={t('information-domains')}>
          {modelInfo.groups
            .map((group) =>
              getLanguageVersion({ data: group.label, lang: i18n.language })
            )
            .sort()
            .join(', ')}
        </BasicBlock>
        <BasicBlock title={t('model-languages')}>
          {modelInfo.languages
            .map(
              (lang) => `${translateLanguage(lang, t)} ${lang.toUpperCase()}`
            )
            .join(', ')}
        </BasicBlock>

        <BasicBlock title={t('links-to-additional-information')}>
          {modelInfo.links && modelInfo.links.length > 0 ? (
            <LinksWrapper>
              {modelInfo.links.map((l, idx) => (
                <li key={`${l.uri}-${idx}`}>
                  <ExternalLink
                    labelNewWindow={t('link-opens-new-window-external')}
                    href={l.uri}
                  >
                    {getLanguageVersion({
                      data: l.name,
                      lang: displayLang ?? i18n.language,
                      appendLocale: true,
                    })}
                  </ExternalLink>
                  {l.description &&
                    Object.values(l.description).some(
                      (desc) => desc.length > 0
                    ) && (
                      <>
                        <br />
                        {getLanguageVersion({
                          data: l.description,
                          lang: displayLang ?? i18n.language,
                          appendLocale: true,
                        })}
                      </>
                    )}
                </li>
              ))}
            </LinksWrapper>
          ) : (
            t('not-added')
          )}
        </BasicBlock>

        <BasicBlock title={t('references-from-other-components')}>
          {t('no-references')}
        </BasicBlock>

        <Separator isLarge />

        <BasicBlock title={t('created')}>
          <FormattedDate date={modelInfo.created} />
          {modelInfo.creator &&
            modelInfo.creator.name &&
            `, ${modelInfo.creator.name}`}
        </BasicBlock>

        <BasicBlock title={''}>
          <PriorVersions modelId={modelId} version={version} />
        </BasicBlock>

        <Separator isLarge />

        <BasicBlock title={t('contributors')}>
          {modelInfo.organizations
            .map((org) =>
              getLanguageVersion({ data: org.label, lang: i18n.language })
            )
            .sort()
            .join(', ')}
        </BasicBlock>
        <BasicBlock title={t('feedback')}>
          <ExternalLink
            href={`mailto:${
              modelInfo.contact && modelInfo.contact !== ''
                ? modelInfo.contact
                : ADMIN_EMAIL
            }?subject=${getLanguageVersion({
              data: modelInfo.label,
              lang: i18n.language,
            })}`}
            labelNewWindow={t('link-opens-new-window-external')}
          >
            {modelInfo.contact ?? ADMIN_EMAIL}
          </ExternalLink>
        </BasicBlock>
      </DrawerContent>
    </>
  );

  function renderModals() {
    return (
      <>
        <AsFileModal
          type="show"
          modelId={modelId}
          visible={openModals.showAsFile}
          onClose={() => handleModalChange('showAsFile', false)}
          version={version}
        />
        {modelInfo && (
          <>
            {hasPermission && (
              <>
                <DeleteModal
                  modelId={modelId}
                  label={getLanguageVersion({
                    data: modelInfo.label,
                    lang: i18n.language,
                  })}
                  type="model"
                  visible={openModals.delete}
                  hide={() => handleModalChange('delete', false)}
                />
                {!version && (
                  <CreateReleaseModal
                    modelId={modelId}
                    visible={openModals.createRelease}
                    hide={() => handleModalChange('createRelease', false)}
                  />
                )}
              </>
            )}

            <AsFileModal
              type="download"
              modelId={modelId}
              filename={getLanguageVersion({
                data: modelInfo.label,
                lang: i18n.language,
              })}
              visible={openModals.downloadAsFile}
              onClose={() => handleModalChange('downloadAsFile', false)}
              version={version}
            />
          </>
        )}
      </>
    );
  }
}
