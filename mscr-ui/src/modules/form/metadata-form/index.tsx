import {
  initialMetadataForm,
  Metadata,
  MetadataFormType,
} from '@app/common/interfaces/metadata.interface';
import { usePatchCrosswalkMutation } from '@app/common/components/crosswalk/crosswalk.slice';
import { usePatchSchemaMutation } from '@app/common/components/schema/schema.slice';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Grid } from '@mui/material';
import {
  Button,
  Button as Sbutton,
  Dropdown,
  DropdownItem,
  IconRemove,
  Textarea,
  TextInput
} from 'suomifi-ui-components';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import { Type, Visibility } from '@app/common/interfaces/search.interface';
import { State } from '@app/common/interfaces/state.interface';
import ConfirmModal from '@app/common/components/confirmation-modal';
import { useStoreDispatch } from '@app/store';
import { setNotification } from '@app/common/components/notifications/notifications.slice';
import FormattedDate from 'yti-common-ui/components/formatted-date';
import {
  DeletableInputWrapper,
  MetadataAttribute,
  MetadataContainer,
  MetadataFormContainer,
  MetadataHeading,
  MetadataLabel,
  MetadataRow,
  RemoveButton,
} from '@app/modules/form/metadata-form/metadata-form.styles';
import { mscrSearchApi } from '@app/common/components/mscr-search/mscr-search.slice';
import { SchemaWithVersionInfo } from '@app/common/interfaces/schema.interface';
import { CrosswalkWithVersionInfo } from '@app/common/interfaces/crosswalk.interface';
import {
  selectIsEditMetadataActive,
  setIsEditMetadataActive,
} from '@app/common/components/content-view/content-view.slice';
import { useSelector } from 'react-redux';
import {
  selectConfirmModalState,
  setConfirmModalState,
} from '@app/common/components/actionmenu/actionmenu.slice';
import Tooltip from '@mui/material/Tooltip';

interface MetadataFormProps {
  type: Type;
  metadata: SchemaWithVersionInfo | CrosswalkWithVersionInfo;
  refetchMetadata: () => void;
  hasEditPermission: boolean;
}
export default function MetadataForm({
  type,
  metadata,
  refetchMetadata,
  hasEditPermission,
}: MetadataFormProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const lang = router.locale ?? '';
  const dispatch = useStoreDispatch();
  const isEditModeActive = useSelector(selectIsEditMetadataActive());
  const confirmModalState = useSelector(selectConfirmModalState());
  const [patchCrosswalk] = usePatchCrosswalkMutation();
  const [patchSchema] = usePatchSchemaMutation();
  const [formData, setFormData] =
    useState<MetadataFormType>(initialMetadataForm);

  const updateMetadata = () => {
    dispatch(setIsEditMetadataActive(false));
    const payload = generatePayload();
    if (type === Type.Crosswalk) {
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
          dispatch(setNotification('CROSSWALK_SAVE'));
          refetchMetadata();
        });
      // ToDo: Error notifications with .catch
    } else if (type === Type.Schema) {
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
          dispatch(setNotification('SCHEMA_SAVE'));
          refetchMetadata();
        });
    }
  };

  const generatePayload = (): Partial<Metadata> => {
    return {
      label: { ...metadata.label, [lang]: formData.label },
      description: { ...metadata.description, [lang]: formData.description },
      contact: formData.contact,
      versionLabel: formData.versionLabel,
      mscr_visibility: formData.mscrVisibility as Visibility,
      mscr_namespace: formData.mscrNamespace,
      domain: formData.domain,
      language: formData.language,
      license: formData.license,
      publisher: formData.publisher,
      identifier: formData.identifier.filter((item) => item !== ''),
      creator: formData.creator.filter((item) => item !== '')
    };
  };

  const setFormValuesFromData = useCallback(() => {
    const localizedLabel = metadata.label
      ? getLanguageVersion({
          data: metadata.label,
          lang,
        })
      : '';
    const localizedDescription = metadata.description
      ? getLanguageVersion({
          data: metadata.description,
          lang,
        })
      : '';
    const formValuesFromData: MetadataFormType = {
      label: localizedLabel,
      description: localizedDescription,
      mscrVisibility:
        metadata.mscr_visibility ?? metadata.visibility ?? Visibility.Private, // Todo: Remove metadata.visibility option when backend uses metadata v2 model
      versionLabel: metadata.versionLabel ?? '',
      contact: metadata.contact ?? '',
      mscrNamespace: metadata.mscr_namespace ?? '',
      domain: metadata.domain ?? '',
      language: metadata.language ?? '',
      license: metadata.license ?? '',
      publisher: metadata.publisher ?? '',
      creator: metadata.creator ?? [],
      identifier: metadata.identifier ?? [],
    };
    setFormData(formValuesFromData);
  }, [metadata, lang]);

  useEffect(() => {
    setFormValuesFromData();
  }, [setFormValuesFromData]);

  // Todo: Make a confirm modal for if you try to cancel with unsaved changes
  function updateFormData(
    attributeName: keyof MetadataFormType,
    newValue?: string | number | undefined,
    index?: number
  ) {
    let attribute = formData[attributeName];
    if (typeof attribute === 'string') {
      attribute = newValue?.toString() ?? '';
    } else if (Array.isArray(attribute)) {
      if (typeof index !== 'undefined') {
        if (typeof newValue !== 'undefined') { // Index and value -> replace value at index
          attribute[index] = newValue?.toString() ?? '';
        } else { // Index but no value -> remove index from array
          attribute.splice(index, 1);
        }
      } else { // No index -> add new to array
        attribute.push('');
      }
    }
    setFormData({ ...formData, [attributeName]: attribute });
  }

  const isCrosswalk = (
    metadata: unknown
  ): metadata is CrosswalkWithVersionInfo => {
    return (
      type === Type.Crosswalk &&
      typeof metadata === 'object' &&
      metadata !== null &&
      'sourceSchemaInfo' in metadata &&
      'targetSchemaInfo' in metadata
    );
  };

  function renderUneditableStringRow(label: string, value?: string | string[]) {
    if (value === undefined || value === null) return <></>;
    const dataList = Array.isArray(value) ? value : [value];
    return (
      <MetadataRow container>
        <Grid item xs={4}>
          <MetadataLabel>{label}:</MetadataLabel>
        </Grid>
        <Grid item xs={8}>
          <MetadataAttribute>
            {dataList.filter((item) => item.trim().length !== 0).join(', ')}
          </MetadataAttribute>
        </Grid>
      </MetadataRow>
    );
  }

  function renderEditableStringRow(
    label: string,
    value: string,
    formDataAttribute: keyof MetadataFormType
  ) {
    return (
      <MetadataRow container>
        <Grid item xs={4}>
          <MetadataLabel>{label}:</MetadataLabel>
        </Grid>
        <Grid item xs={8}>
          {isEditModeActive && (
            <TextInput
              labelText={label}
              labelMode={'hidden'}
              onChange={(newValue) =>
                updateFormData(formDataAttribute, newValue)
              }
              value={value}
            />
          )}
          {!isEditModeActive && (
            <MetadataAttribute>{value ?? ''}</MetadataAttribute>
          )}
        </Grid>
      </MetadataRow>
    );
  }

  function renderDeletableInput(
    value: string,
    formDataAttribute: keyof MetadataFormType,
    index: number
  ) {
    return (
      <DeletableInputWrapper key={index}>
        <TextInput
          labelText={formDataAttribute + '-' + index}
          labelMode={'hidden'}
          onChange={(newValue) =>
            updateFormData(formDataAttribute, newValue, index)
          }
          value={value}
        />
        <Tooltip title={t('remove')} placement={'right-end'}>
          <RemoveButton
            icon={<IconRemove />}
            variant={'secondary'}
            onClick={() => updateFormData(formDataAttribute, undefined, index)}
          ></RemoveButton>
        </Tooltip>
      </DeletableInputWrapper>
    );
  }

  function renderEditableListRow(
    label: string,
    valueArray: string[],
    formDataAttribute: keyof MetadataFormType
  ) {
    const values = Array.isArray(valueArray) ? valueArray : [valueArray]; // May be simplified when backend only returns array of strings
    return (
      <MetadataRow container>
        <Grid item xs={4}>
          <MetadataLabel>{label}:</MetadataLabel>
        </Grid>
        <Grid item xs={8}>
          {isEditModeActive && (
            <>
              {values.map((item, index) =>
                renderDeletableInput(item, formDataAttribute, index)
              )}
              <Button onClick={() => updateFormData(formDataAttribute)}>
                {t('add') + ' ' + formDataAttribute}
              </Button>
            </>
          )}
          {!isEditModeActive && (
            <MetadataAttribute>
              {values.join(', ')}
            </MetadataAttribute>
          )}
        </Grid>
      </MetadataRow>
    );
  }

  return (
    <MetadataContainer>
      <Grid container>
        <Grid item xs={6}>
          {type === Type.Crosswalk ? (
            <MetadataHeading variant={'h2'}>
              {t('metadata.crosswalk-details')}
            </MetadataHeading>
          ) : (
            <MetadataHeading variant={'h2'}>
              {t('metadata.schema-details')}
            </MetadataHeading>
          )}
        </Grid>
      </Grid>
      <MetadataFormContainer container>
        <Grid item xs={12} md={7}>
          {renderEditableStringRow(t('metadata.name'), formData.label, 'label')}
          {renderUneditableStringRow(
            t('metadata.pid'),
            metadata.handle ?? t('metadata.not-available')
          )}
          {renderEditableListRow(
            t('metadata.identifier'),
            formData.identifier,
            'identifier'
          )}
          {renderEditableStringRow(
            t('metadata.version-label'),
            formData.versionLabel,
            'versionLabel'
          )}
          {renderEditableStringRow(
            t('metadata.name-space-label'),
            formData.mscrNamespace,
            'mscrNamespace'
          )}

          {renderEditableListRow(
            t('metadata.creator'),
            formData.creator,
            'creator'
          )}
          {renderEditableStringRow(
            t('metadata.contact'),
            formData.contact,
            'contact'
          )}
          {renderEditableStringRow(
            t('metadata.domain'),
            formData.domain,
            'domain'
          )}
          {renderEditableStringRow(
            t('metadata.language'),
            formData.language,
            'language'
          )}
          {renderEditableStringRow(
            t('metadata.license'),
            formData.license,
            'license'
          )}
          {renderEditableStringRow(
            t('metadata.publisher'),
            formData.publisher,
            'publisher'
          )}

          {renderUneditableStringRow(
            t('metadata.mscr-creator'),
            metadata.mscr_creator
          )}
          {renderUneditableStringRow(
            t('metadata.mscr-owner'),
            metadata.ownerMetadata.map((o) => o.name ?? o.id)
          )}
          {renderUneditableStringRow(t('metadata.format'), metadata.format)}

          <MetadataRow container>
            <Grid item xs={4}>
              <MetadataLabel>{t('metadata.created')}:</MetadataLabel>
            </Grid>
            <Grid item xs={8}>
              <MetadataAttribute>
                <FormattedDate date={metadata.created} />
              </MetadataAttribute>
            </Grid>
          </MetadataRow>

          <MetadataRow container>
            <Grid item xs={4}>
              <MetadataLabel>{t('metadata.modified')}:</MetadataLabel>
            </Grid>
            <Grid item xs={8}>
              <MetadataAttribute>
                <FormattedDate date={metadata.modified} />
              </MetadataAttribute>
            </Grid>
          </MetadataRow>

          {renderUneditableStringRow(
            t('metadata.mscr-state'),
            metadata.mscr_state?.toString()
          )}

          {/*TODO: Remove this or modify when backend uses v2 model for metadata*/}
          {renderUneditableStringRow(
            t('metadata.mscr-state'),
            metadata.state?.toString()
          )}

          <MetadataRow container>
            <Grid item xs={4}>
              <MetadataLabel>{t('metadata.mscr-visibility')}:</MetadataLabel>
            </Grid>
            <Grid item xs={8}>
              {isEditModeActive && metadata.state === State.Draft && (
                <Dropdown
                  labelText={t('metadata.mscr-visibility')}
                  labelMode={'hidden'}
                  value={formData.mscrVisibility}
                  onChange={(newValue) =>
                    updateFormData('mscrVisibility', newValue)
                  }
                >
                  <DropdownItem
                    key={Visibility.Public}
                    value={Visibility.Public}
                  >
                    {Visibility.Public}
                  </DropdownItem>
                  <DropdownItem
                    key={Visibility.Private}
                    value={Visibility.Private}
                  >
                    {Visibility.Private}
                  </DropdownItem>
                </Dropdown>
              )}
              {(!isEditModeActive || metadata.state !== State.Draft) && (
                <MetadataAttribute>{metadata.visibility}</MetadataAttribute>
              )}
            </Grid>
          </MetadataRow>
        </Grid>

        <Grid item xs={12} md={5}>
          <MetadataRow container>
            <Grid item xs={4}>
              <MetadataLabel>{t('metadata.description')}:</MetadataLabel>
            </Grid>
            <Grid item xs={8}>
              {isEditModeActive && (
                <Textarea
                  labelText={t('metadata.description')}
                  labelMode={'hidden'}
                  resize="vertical"
                  onChange={(event) =>
                    updateFormData('description', event.target.value)
                  }
                  value={formData.description}
                ></Textarea>
              )}
              {!isEditModeActive && <p>{formData.description}</p>}
            </Grid>
          </MetadataRow>

          {/*TODO: wrapping*/}
          {renderUneditableStringRow(
            t('metadata.source-url'),
            metadata.sourceURL
          )}

          {isCrosswalk(metadata) && (
            <>
              {renderUneditableStringRow(
                t('metadata.source-schema'),
                metadata.sourceSchemaInfo.name
              )}
              {renderUneditableStringRow(
                t('metadata.source-schema-id'),
                metadata.sourceSchemaInfo.handle ?? metadata.sourceSchemaInfo.id
              )}
              {renderUneditableStringRow(
                t('metadata.target-schema'),
                metadata.targetSchemaInfo.name
              )}
              {renderUneditableStringRow(
                t('metadata.target-schema-id'),
                metadata.targetSchemaInfo.handle ?? metadata.targetSchemaInfo.id
              )}
            </>
          )}
        </Grid>

        <Grid container direction="row" justifyContent="flex-end">
          {hasEditPermission && isEditModeActive && (
            <>
              <Sbutton
                className="align-self-end my-3"
                hidden={!isEditModeActive}
                onClick={() => {
                  dispatch(
                    setConfirmModalState({ key: 'saveMetadata', value: true })
                  );
                }}
              >
                {t('action.save')}
              </Sbutton>

              <Sbutton
                className="align-self-end ms-2 my-3"
                hidden={!isEditModeActive}
                variant="secondary"
                onClick={() => {
                  dispatch(setIsEditMetadataActive(false));
                  setFormValuesFromData();
                }}
              >
                {t('action.cancel')}
              </Sbutton>
            </>
          )}
        </Grid>
      </MetadataFormContainer>
      {confirmModalState.saveMetadata && (
        <ConfirmModal
          actionText={t('action.save')}
          cancelText={t('action.cancel')}
          confirmAction={updateMetadata}
          onClose={() =>
            dispatch(
              setConfirmModalState({ key: 'saveMetadata', value: false })
            )
          }
          heading={t('confirm-modal.heading')}
          text1={t('confirm-modal.save')}
        />
      )}
    </MetadataContainer>
  );
}
