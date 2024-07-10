import {
  useDeleteCrosswalkMutation,
  usePatchCrosswalkMutation,
} from '@app/common/components/crosswalk/crosswalk.slice';
import {
  useDeleteSchemaMutation,
  usePatchSchemaMutation,
} from '@app/common/components/schema/schema.slice';
import { useTranslation } from 'next-i18next';
import { ActionMenu, ActionMenuItem } from 'suomifi-ui-components';
import * as React from 'react';
import { ReactElement, useEffect, useState } from 'react';
import { ActionMenuTypes, Type } from '@app/common/interfaces/search.interface';
import { State } from '@app/common/interfaces/state.interface';
import ConfirmModal from '@app/common/components/confirmation-modal';
import { useStoreDispatch } from '@app/store';
import { setNotification } from '@app/common/components/notifications/notifications.slice';
import { mscrSearchApi } from '@app/common/components/mscr-search/mscr-search.slice';
import { CrosswalkWithVersionInfo } from '@app/common/interfaces/crosswalk.interface';
import { SchemaWithVersionInfo } from '@app/common/interfaces/schema.interface';
import { ActionMenuWrapper } from '@app/common/components/schema-and-crosswalk-actionmenu/schema-and-crosswalk-actionmenu.styles';
import FormModal, { ModalType } from '@app/modules/form';
import { Format, formatsAvailableForMscrCopy } from '@app/common/interfaces/format.interface';
import { useSelector } from 'react-redux';
import { selectMenuList } from '@app/common/components/actionmenu/actionmenu.slice';

interface SchemaAndCrosswalkActionmenuProps {
  type: ActionMenuTypes;
  metadata: SchemaWithVersionInfo | CrosswalkWithVersionInfo;
  isMappingsEditModeActive: boolean;
  refetchMetadata: () => void;
  buttonCallbackFunction?: (action: string) => void;
}

export default function SchemaAndCrosswalkActionMenu({
  type,
  metadata,
  isMappingsEditModeActive,
  refetchMetadata,
  buttonCallbackFunction = () => {
    return;
  },
}: SchemaAndCrosswalkActionmenuProps) {
  const { t } = useTranslation('common');
  const dispatch = useStoreDispatch();
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  const [patchCrosswalk, crosswalkPatchResponse] = usePatchCrosswalkMutation();
  const [patchSchema] = usePatchSchemaMutation();
  const [deleteSchema] = useDeleteSchemaMutation();
  const [deleteCrosswalk] = useDeleteCrosswalkMutation();
  const menuState = useSelector(selectMenuList());
  const [isPublishConfirmModalOpen, setPublishConfirmModalOpen] =
    useState(false);
  const [isInvalidateConfirmModalOpen, setInvalidateConfirmModalOpen] =
    useState(false);
  const [isDeprecateConfirmModalOpen, setDeprecateConfirmModalOpen] =
    useState(false);
  const [isDeleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [isRemoveConfirmModalOpen, setRemoveConfirmModalOpen] = useState(false);
  const [isRevisionModalOpen, setRevisionModalOpen] = useState(false);
  const [isMscrCopyModalOpen, setMscrCopyModalOpen] = useState(false);
  const [isCrosswalkPublished, setCrosswalkPublished] =
    React.useState<boolean>(false);
  // const [isLatestVersion, setIsLatestVersion] = useState(false);

  if (!isCrosswalkPublished && crosswalkPatchResponse.isSuccess) {
    if (
      crosswalkPatchResponse?.originalArgs?.payload?.state === State.Published
    ) {
      buttonCallbackFunction('disableEdit');
      setIsEditModeActive(false);
      setCrosswalkPublished(true);
    }
  }

  const performModalAction = (action: string) => {
    setPublishConfirmModalOpen(false);
    setDeleteConfirmModalOpen(false);
    setRemoveConfirmModalOpen(false);
    setInvalidateConfirmModalOpen(false);
    setDeprecateConfirmModalOpen(false);
    if (action === 'close') {
      return;
    }
    const payload: { versionLabel: string; state?: State } = {
      versionLabel: metadata.versionLabel,
    };
    switch (action) {
      case 'publish':
        payload.state = State.Published;
        break;
      case 'deprecate':
        payload.state = State.Deprecated;
        break;
      case 'invalidate':
        payload.state = State.Invalid;
        break;
      case 'remove':
        payload.state = State.Removed;
    }
    if (['publish', 'invalidate', 'deprecate', 'remove'].includes(action)) {
      setIsEditModeActive(false);
      if (
        type !== ActionMenuTypes.Schema &&
        type !== ActionMenuTypes.SchemaMetadata
      ) {
        patchCrosswalk({ payload: payload, pid: metadata.pid })
          .unwrap()
          .then(() => {
            dispatch(
              mscrSearchApi.util.invalidateTags([
                'PersonalContent',
                'OrgContent',
                'MscrSearch',
              ])
            );
            dispatch(
              setNotification(
                action === 'publish'
                  ? 'CROSSWALK_PUBLISH'
                  : action === 'invalidate'
                    ? 'CROSSWALK_INVALIDATE'
                    : action === 'deprecate'
                      ? 'CROSSWALK_DEPRECATE'
                      : 'CROSSWALK_DELETE'
              )
            );
            refetchMetadata();
          });
        // ToDo: Error notifications with .catch
      } else if (
        type === ActionMenuTypes.Schema ||
        type === ActionMenuTypes.SchemaMetadata
      ) {
        patchSchema({ payload: payload, pid: metadata.pid })
          .unwrap()
          .then(() => {
            dispatch(
              mscrSearchApi.util.invalidateTags([
                'PersonalContent',
                'OrgContent',
                'MscrSearch',
              ])
            );
            dispatch(
              setNotification(
                action === 'publish'
                  ? 'SCHEMA_PUBLISH'
                  : action === 'invalidate'
                    ? 'SCHEMA_INVALIDATE'
                    : action === 'deprecate'
                      ? 'SCHEMA_DEPRECATE'
                      : 'SCHEMA_DELETE'
              )
            );
            refetchMetadata();
          });
      }
    }
    if (action === 'deleteCrosswalk') {
      deleteCrosswalk(metadata.pid.toString())
        .unwrap()
        .then(() => {
          dispatch(
            mscrSearchApi.util.invalidateTags([
              'MscrSearch',
              'OrgContent',
              'PersonalContent',
            ])
          );
          dispatch(setNotification('CROSSWALK_DELETE'));
          refetchMetadata();
        });
      // ToDo: Error notifications with .catch
    } else if (action === 'deleteSchema') {
      deleteSchema(metadata.pid.toString())
        .unwrap()
        .then(() => {
          dispatch(
            mscrSearchApi.util.invalidateTags([
              'MscrSearch',
              'OrgContent',
              'PersonalContent',
            ])
          );
          dispatch(setNotification('SCHEMA_DELETE'));
          refetchMetadata();
        });
      // ToDo: Error notifications with .catch
    }
  };

  useEffect(() => {
    setIsEditModeActive(isMappingsEditModeActive);
  }, [isMappingsEditModeActive]);

  // useEffect(() => {
  //   const revisions = metadata.revisions;
  //   if (revisions.length > 0) {
  //     const latestVersion = revisions[revisions.length - 1].pid;
  //     if (metadata.pid == latestVersion) {
  //       setIsLatestVersion(true);
  //     } else {
  //       setIsLatestVersion(false);
  //     }
  //   }
  // }, [metadata.revisions, metadata.pid]);

  // if (type == ActionMenuTypes.NoEditPermission) {
  //   return renderStubMenu();
  // }

  function getActionMenuItems() {
    const items: ReactElement[] = [];
    if (menuState.editContent) {
      items.push(
        <ActionMenuItem
          key={'editContent'}
          onClick={() => buttonCallbackFunction('edit')}
        >
          {isEditModeActive
            ? t('actionmenu.finish-editing')
            : t('actionmenu.edit-mappings')}
        </ActionMenuItem>
      );
    }
    if (menuState.editMetadata) {
      items.push(
        <ActionMenuItem
          key={'editMetadata'}
          onClick={() => buttonCallbackFunction('edit')}
        >
          {t('actionmenu.edit-metadata')}
        </ActionMenuItem>
      );
    }
    if (menuState.publish) {
      items.push(
        <ActionMenuItem
          key={'publish'}
          onClick={() => setPublishConfirmModalOpen(true)}
        >
          {type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('actionmenu.publish-schema')
            : t('actionmenu.publish-crosswalk')}
        </ActionMenuItem>
      );
    }
    if (menuState.invalidate) {
      items.push(
        <ActionMenuItem
          key={'invalidate'}
          onClick={() => setInvalidateConfirmModalOpen(true)}
        >
          {type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('actionmenu.invalidate-schema')
            : t('actionmenu.invalidate-crosswalk')}
        </ActionMenuItem>
      );
    }
    if (menuState.deprecate) {
      items.push(
        <ActionMenuItem
          key={'deprecate'}
          onClick={() => setDeprecateConfirmModalOpen(true)}
        >
          {type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('actionmenu.deprecate-schema')
            : t('actionmenu.deprecate-crosswalk')}
        </ActionMenuItem>
      );
    }
    if (menuState.remove) {
      items.push(
        <ActionMenuItem
          key={'remove'}
          onClick={() => setRemoveConfirmModalOpen(true)}
        >
          {type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('actionmenu.delete-schema')
            : t('actionmenu.delete-crosswalk')}
        </ActionMenuItem>
      );
    }
    if (menuState.version) {
      items.push(
        <ActionMenuItem
          key={'version'}
          onClick={() => setRevisionModalOpen(true)}
        >
          {t('actionmenu.revision')}
        </ActionMenuItem>
      );
    }
    if (menuState.mscrCopy) {
      items.push(
        <ActionMenuItem
          key={'mscrCopy'}
          onClick={() => setMscrCopyModalOpen(true)}
        >
          {t('actionmenu.mscr-copy')}
        </ActionMenuItem>
      );
    }
    if (menuState.deleteDraft) {
      items.push(
        <ActionMenuItem
          key={'deleteDraft'}
          onClick={() => setDeleteConfirmModalOpen(true)}
        >
          {t('actionmenu.delete-draft')}
        </ActionMenuItem>
      );
    }
    return items;
  }

  return (
    <>
      {Object.values(menuState).some((isTrue) => isTrue) && (
        <ActionMenuWrapper>
          <ActionMenu buttonText={t('action.actions')}>
            {getActionMenuItems()}
          </ActionMenu>
        </ActionMenuWrapper>
      )}
      <ConfirmModal
        isVisible={isDeleteConfirmModalOpen}
        actionName={
          type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? 'deleteSchema'
            : 'deleteCrosswalk'
        }
        actionText={
          type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('actionmenu.delete-schema')
            : t('actionmenu.delete-crosswalk')
        }
        cancelText={t('action.cancel')}
        performConfirmModalAction={performModalAction}
        heading={t('confirm-modal.heading')}
        text1={t('confirm-modal.delete-draft')}
        text2={t('confirm-modal.delete-draft-info')}
      />

      <ConfirmModal
        isVisible={isRemoveConfirmModalOpen}
        actionName={'remove'}
        actionText={
          type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('actionmenu.delete-schema')
            : t('actionmenu.delete-crosswalk')
        }
        cancelText={t('action.cancel')}
        performConfirmModalAction={performModalAction}
        heading={t('confirm-modal.heading')}
        text1={
          type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('confirm-modal.delete-schema')
            : t('confirm-modal.delete-crosswalk')
        }
        text2={t('confirm-modal.delete-info')}
      />

      <ConfirmModal
        isVisible={isPublishConfirmModalOpen}
        actionName={'publish'}
        actionText={t('action.publish')}
        cancelText={t('action.cancel')}
        performConfirmModalAction={performModalAction}
        heading={t('confirm-modal.heading')}
        text1={
          type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('confirm-modal.publish-schema')
            : t('confirm-modal.publish-crosswalk1')
        }
        text2={
          type !== ActionMenuTypes.Schema &&
          type !== ActionMenuTypes.SchemaMetadata
            ? t('confirm-modal.publish-crosswalk2')
            : undefined
        }
      />

      <ConfirmModal
        isVisible={isInvalidateConfirmModalOpen}
        actionName={'invalidate'}
        actionText={t('action.invalidate')}
        cancelText={t('action.cancel')}
        performConfirmModalAction={performModalAction}
        heading={t('confirm-modal.heading')}
        text1={
          type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('confirm-modal.invalidate-schema')
            : t('confirm-modal.invalidate-crosswalk')
        }
        text2={undefined}
      />

      <ConfirmModal
        isVisible={isDeprecateConfirmModalOpen}
        actionName={'deprecate'}
        actionText={t('action.deprecate')}
        cancelText={t('action.cancel')}
        performConfirmModalAction={performModalAction}
        heading={t('confirm-modal.heading')}
        text1={
          type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? t('confirm-modal.deprecate-schema')
            : t('confirm-modal.deprecate-crosswalk')
        }
        text2={undefined}
      />

      <FormModal
        modalType={
          metadata.format == Format.Mscr
            ? ModalType.RevisionMscr
            : ModalType.RevisionFull
        }
        contentType={
          type === ActionMenuTypes.Schema ||
          type === ActionMenuTypes.SchemaMetadata
            ? Type.Schema
            : Type.Crosswalk
        }
        visible={isRevisionModalOpen}
        setVisible={setRevisionModalOpen}
        initialData={metadata}
      />
      <FormModal
        modalType={ModalType.McsrCopy}
        contentType={Type.Schema}
        visible={isMscrCopyModalOpen}
        setVisible={setMscrCopyModalOpen}
        initialData={metadata}
      />
    </>
  );

  function renderStubMenu() {
    return (
      <>
        <ActionMenuWrapper>
          <ActionMenu buttonText={t('action.actions')}>
            <ActionMenuItem onClick={() => setMscrCopyModalOpen(true)}>
              {t('actionmenu.mscr-copy')}
            </ActionMenuItem>
          </ActionMenu>
        </ActionMenuWrapper>
        <FormModal
          modalType={ModalType.McsrCopy}
          contentType={Type.Schema}
          visible={isMscrCopyModalOpen}
          setVisible={setMscrCopyModalOpen}
          initialData={metadata}
        />
      </>
    );
  }
}
