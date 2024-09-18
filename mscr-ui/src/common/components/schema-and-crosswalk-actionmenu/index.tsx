import { useTranslation } from 'next-i18next';
import { ActionMenu, ActionMenuItem } from 'suomifi-ui-components';
import { ReactElement } from 'react';
import { useStoreDispatch } from '@app/store';
import { ActionMenuWrapper } from '@app/common/components/schema-and-crosswalk-actionmenu/schema-and-crosswalk-actionmenu.styles';
import { useSelector } from 'react-redux';
import {
  selectIsCrosswalk,
  selectMenuList,
  setConfirmModalState,
  setFormModalState,
} from '@app/common/components/actionmenu/actionmenu.slice';
import {
  selectIsEditContentActive,
  selectIsEditMetadataActive,
  setIsEditContentActive,
  setIsEditMetadataActive,
} from '@app/common/components/content-view/content-view.slice';
import { setNotification } from '@app/common/components/notifications/notifications.slice';
import { resetDataTypeSearch } from '@app/common/components/data-type-registry-search/data-type-registry-search.slice';

export default function SchemaAndCrosswalkActionMenu() {
  const { t } = useTranslation('common');
  const dispatch = useStoreDispatch();
  const isCrosswalk = useSelector(selectIsCrosswalk());
  const menuState = useSelector(selectMenuList());
  const isContentEditActive = useSelector(selectIsEditContentActive());
  const isMetadataEditActive = useSelector(selectIsEditMetadataActive());

  function getActionMenuItems() {
    const items: ReactElement[] = [];
    if (menuState.editContent) {
      items.push(
        <ActionMenuItem
          key={'editContent'}
          onClick={() => {
            dispatch(setIsEditContentActive(!isContentEditActive));
            dispatch(resetDataTypeSearch());
            dispatch(
              setNotification(
                isContentEditActive
                  ? isCrosswalk
                    ? 'FINISH_EDITING_MAPPINGS'
                    : 'FINISH_EDITING_SCHEMA'
                  : isCrosswalk
                    ? 'EDIT_MAPPINGS'
                    : 'EDIT_SCHEMA'
              )
            );
          }}
        >
          {isContentEditActive
            ? t('actionmenu.finish-editing')
            : isCrosswalk
              ? t('actionmenu.edit-mappings')
              : t('actionmenu.edit-schema')}
        </ActionMenuItem>
      );
    }
    if (menuState.editMetadata && !isMetadataEditActive) {
      items.push(
        <ActionMenuItem
          key={'editMetadata'}
          onClick={() =>
            dispatch(setIsEditMetadataActive(!isMetadataEditActive))
          }
        >
          {t('actionmenu.edit-metadata')}
        </ActionMenuItem>
      );
    }
    if (menuState.publish) {
      items.push(
        <ActionMenuItem
          key={'publish'}
          onClick={() =>
            dispatch(setConfirmModalState({ key: 'publish', value: true }))
          }
        >
          {isCrosswalk
            ? t('actionmenu.publish-crosswalk')
            : t('actionmenu.publish-schema')}
        </ActionMenuItem>
      );
    }
    if (menuState.invalidate) {
      items.push(
        <ActionMenuItem
          key={'invalidate'}
          onClick={() =>
            dispatch(setConfirmModalState({ key: 'invalidate', value: true }))
          }
        >
          {isCrosswalk
            ? t('actionmenu.invalidate-crosswalk')
            : t('actionmenu.invalidate-schema')}
        </ActionMenuItem>
      );
    }
    if (menuState.deprecate) {
      items.push(
        <ActionMenuItem
          key={'deprecate'}
          onClick={() =>
            dispatch(setConfirmModalState({ key: 'deprecate', value: true }))
          }
        >
          {isCrosswalk
            ? t('actionmenu.deprecate-crosswalk')
            : t('actionmenu.deprecate-schema')}
        </ActionMenuItem>
      );
    }
    if (menuState.remove) {
      items.push(
        <ActionMenuItem
          key={'remove'}
          onClick={() =>
            dispatch(setConfirmModalState({ key: 'remove', value: true }))
          }
        >
          {isCrosswalk
            ? t('actionmenu.delete-crosswalk')
            : t('actionmenu.delete-schema')}
        </ActionMenuItem>
      );
    }
    if (menuState.version) {
      items.push(
        <ActionMenuItem
          key={'version'}
          onClick={() =>
            dispatch(setFormModalState({ key: 'version', value: true }))
          }
        >
          {t('actionmenu.revision')}
        </ActionMenuItem>
      );
    }
    if (menuState.mscrCopy) {
      items.push(
        <ActionMenuItem
          key={'mscrCopy'}
          onClick={() =>
            dispatch(setFormModalState({ key: 'mscrCopy', value: true }))
          }
        >
          {t('actionmenu.mscr-copy')}
        </ActionMenuItem>
      );
    }
    if (menuState.unsetRootNodeSelection) {
      items.push(
        <ActionMenuItem
          key={'unsetRootNodeSelection'}
          onClick={() =>
            dispatch(setConfirmModalState({ key: 'unsetRootNodeSelection', value: true }))
          }
        >
          {t('actionmenu.unsetRootNodeSelection')}
        </ActionMenuItem>
      );
    }
    if (menuState.deleteDraft) {
      items.push(
        <ActionMenuItem
          key={'deleteDraft'}
          className={'deleteDraft'}
          onClick={() =>
            dispatch(setConfirmModalState({ key: 'deleteDraft', value: true }))
          }
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
          <ActionMenu
            buttonText={
              isCrosswalk
                ? t('action.crosswalk-actions')
                : t('action.schema-actions')
            }
          >
            {getActionMenuItems()}
          </ActionMenu>
        </ActionMenuWrapper>
      )}
    </>
  );
}
