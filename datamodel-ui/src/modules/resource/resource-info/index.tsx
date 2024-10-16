import { Resource } from '@app/common/interfaces/resource.interface';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import HasPermission from '@app/common/utils/has-permission';
import {
  translateCommonForm,
  translateStatus,
} from '@app/common/utils/translation-helpers';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  IconArrowLeft,
  IconOptionsVertical,
  InlineAlert,
  Text,
  Tooltip,
} from 'suomifi-ui-components';
import DrawerContent from 'yti-common-ui/drawer/drawer-content-wrapper';
import StaticHeader from 'yti-common-ui/drawer/static-header';
import Separator from 'yti-common-ui/separator';
import { TooltipWrapper } from '@app/modules/model/model.styles';
import DeleteModal from '@app/modules/delete-modal';
import CommonViewContent from '@app/modules/common-view-content';
import { StatusChip } from '@app/common/components/resource-list/resource-list.styles';
import { useGetAwayListener } from '@app/common/utils/hooks/use-get-away-listener';
import LocalCopyModal from '@app/modules/local-copy-modal';
import { useSelector } from 'react-redux';
import { selectDisplayLang } from '@app/common/components/model/model.slice';
import ApplicationProfileTop from '../resource-form/components/application-profile-top';
import { useTogglePropertyShapeMutation } from '@app/common/components/resource/resource.slice';
import getApiError from '@app/common/utils/get-api-errors';
import { RenameModal } from '@app/modules/rename-modal';

interface CommonViewProps {
  data?: Resource;
  inUse?: boolean;
  modelId: string;
  handleReturn: () => void;
  handleShowResource: (id: string, modelPrefix: string) => void;
  handleEdit: () => void;
  handleRefetch: () => void;
  isPartOfCurrentModel: boolean;
  applicationProfile?: boolean;
  currentModelId?: string;
  disableEdit?: boolean;
  organizationIds?: string[];
}

export default function ResourceInfo({
  data,
  inUse,
  modelId,
  handleReturn,
  handleShowResource,
  handleEdit,
  handleRefetch,
  isPartOfCurrentModel,
  applicationProfile,
  currentModelId,
  disableEdit,
  organizationIds,
}: CommonViewProps) {
  const { t, i18n } = useTranslation('common');
  const [headerHeight, setHeaderHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const displayLang = useSelector(selectDisplayLang());
  const hasPermission = HasPermission({
    actions: ['EDIT_ASSOCIATION', 'EDIT_ATTRIBUTE'],
    targetOrganization: organizationIds,
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [localCopyVisible, setLocalCopyVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [externalEdit, setExternalEdit] = useState(false);
  const [externalActive, setExternalActive] = useState(inUse);
  const [togglePropertyShape, toggleResult] = useTogglePropertyShapeMutation();
  const { ref: toolTipRef } = useGetAwayListener(showTooltip, setShowTooltip);

  const handleExternalEditSave = () => {
    if (externalActive !== inUse) {
      togglePropertyShape({
        modelId: currentModelId ?? '',
        uri: data?.uri ?? '',
      });
    }
  };

  useEffect(() => {
    setExternalActive(inUse);
  }, [inUse]);

  useEffect(() => {
    if (toggleResult.isSuccess) {
      setExternalEdit(false);
      handleRefetch();
    }
  }, [toggleResult, handleRefetch]);

  useEffect(() => {
    if (ref.current) {
      setHeaderHeight(ref.current.clientHeight);
    }
  }, [ref]);

  return (
    <>
      <StaticHeader ref={ref}>
        <div>
          <Button
            variant="secondaryNoBorder"
            icon={<IconArrowLeft />}
            style={{ textTransform: 'uppercase' }}
            onClick={handleReturn}
            ref={toolTipRef}
            id="back-button"
          >
            {data ? translateCommonForm('return', data.type, t) : t('back')}
          </Button>
          {!disableEdit && hasPermission && data && !externalEdit && (
            <div>
              <Button
                variant="secondary"
                iconRight={<IconOptionsVertical />}
                style={{ height: 'min-content' }}
                onClick={() => setShowTooltip(!showTooltip)}
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
                  {isPartOfCurrentModel ? (
                    <>
                      <Button
                        variant="secondaryNoBorder"
                        onClick={() => handleEdit()}
                        id="edit-button"
                      >
                        {t('edit', { ns: 'admin' })}
                      </Button>
                      <Button
                        variant="secondaryNoBorder"
                        onClick={() => setRenameVisible(true)}
                        id="rename-class-button"
                      >
                        {t('rename', { ns: 'admin' })}
                      </Button>
                      <Separator />
                      <Button
                        variant="secondaryNoBorder"
                        onClick={() => setDeleteVisible(true)}
                        id="remove-button"
                      >
                        {t('remove', { ns: 'admin' })}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondaryNoBorder"
                        onClick={() => {
                          setExternalActive(inUse);
                          setExternalEdit(true);
                        }}
                        id="edit-button"
                      >
                        {t('edit', { ns: 'admin' })}
                      </Button>
                      <Button
                        variant="secondaryNoBorder"
                        onClick={() => setLocalCopyVisible(true)}
                        id="local-copy-button"
                      >
                        {t('create-local-copy', { ns: 'admin' })}
                      </Button>
                    </>
                  )}
                </Tooltip>
              </TooltipWrapper>
              <LocalCopyModal
                visible={localCopyVisible}
                hide={() => setLocalCopyVisible(false)}
                targetModelId={currentModelId ?? ''}
                sourceModelId={modelId}
                sourceIdentifier={data.identifier}
                handleReturn={handleShowResource}
              />
              <DeleteModal
                modelId={modelId}
                resourceId={data.identifier}
                type={data.type === 'ASSOCIATION' ? 'association' : 'attribute'}
                label={getLanguageVersion({
                  data: data.label,
                  lang: i18n.language,
                })}
                onClose={handleReturn}
                visible={deleteVisible}
                hide={() => setDeleteVisible(false)}
              />
              <RenameModal
                modelId={modelId}
                resourceId={data.identifier}
                visible={renameVisible}
                hide={() => setRenameVisible(false)}
                handleReturn={handleShowResource}
              />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {!externalEdit ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text variant="bold">
                {data &&
                  getLanguageVersion({
                    data: data.label,
                    lang: displayLang ?? i18n.language,
                  })}
              </Text>
              <StatusChip $isValid={data && data.status === 'VALID'}>
                {data && translateStatus(data.status, t)}
              </StatusChip>
            </div>
          ) : (
            <>
              <Text variant="bold">
                {data &&
                  getLanguageVersion({
                    data: data.label,
                    lang: displayLang ?? i18n.language,
                  })}
              </Text>
              <div style={{ display: 'flex', gap: '15px' }}>
                <Button onClick={handleExternalEditSave} id="submit-button">
                  {t('save', { ns: 'admin' })}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setExternalEdit(false)}
                  id="cancel-button"
                >
                  {t('cancel-variant', { ns: 'admin' })}
                </Button>
              </div>
            </>
          )}
        </div>
      </StaticHeader>

      <DrawerContent height={headerHeight}>
        {data && (
          <>
            {externalEdit && (
              <>
                {toggleResult.error && (
                  <InlineAlert status="error">
                    {getApiError(toggleResult.error)[0]}
                  </InlineAlert>
                )}
                <ApplicationProfileTop
                  inUse={externalActive === undefined ? true : externalActive}
                  setInUse={setExternalActive}
                  type={data.type}
                  applicationProfile={applicationProfile}
                  external
                />
              </>
            )}

            <CommonViewContent
              applicationProfile={applicationProfile}
              modelId={modelId}
              data={data}
              inUse={inUse}
            />
          </>
        )}
      </DrawerContent>
    </>
  );
}
