import {
  initialMetadataForm,
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
import { Schema, SchemaWithVersionInfo } from '@app/common/interfaces/schema.interface';
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

  const isCrosswalk = useCallback((
    metadata: unknown
  ): metadata is CrosswalkWithVersionInfo => {
    return (
      type === Type.Crosswalk &&
      typeof metadata === 'object' &&
      metadata !== null &&
      'sourceSchemaInfo' in metadata &&
      'targetSchemaInfo' in metadata
    );
  }, [type]);

  const updateMetadata = () => {
    dispatch(setIsEditMetadataActive(false));
    const payload = generatePayload();
    if (type === Type.Crosswalk) {
      patchCrosswalk({ payload: payload, pid: metadata.id })
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
      patchSchema({ payload: payload, pid: metadata.id })
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

  const generatePayload = (): Partial<Schema> => {
    return {
      label: { ...metadata.label, [lang]: formData.label },
      description: { ...metadata.description, [lang]: formData.description },
      contact: formData.contact,
      versionLabel: formData.versionLabel,
      visibility: formData.visibility as Visibility,
      namespace: formData.namespace,
      domain: formData.domain,
      dctLicense: formData.dctLicense,
      dctPublisher: formData.dctPublisher,
      dctIdentifiers: formData.dctIdentifiers.filter((item) => item !== ''),
      dctCreators: formData.dctCreators.filter((item) => item !== '')
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
      visibility: metadata.visibility ?? Visibility.Private,
      versionLabel: metadata.versionLabel ?? '',
      contact: metadata.contact ?? '',
      namespace: isCrosswalk(metadata) ? '' : metadata.namespace ?? '',
      domain: metadata.domain ?? '',
      dctLicense: metadata.dctLicense ?? '',
      dctPublisher: metadata.dctPublisher ?? '',
      dctCreators: metadata.dctCreators ?? [],
      dctIdentifiers: metadata.dctIdentifiers ?? [],
    };
    setFormData(formValuesFromData);
  }, [metadata, lang, isCrosswalk]);

  useEffect(() => {
    setFormValuesFromData();
  }, [setFormValuesFromData]);

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
          attribute = attribute.filter((_, i) => i !== index);
        }
      } else { // No index -> add new to array
        attribute = attribute.concat(['']);
      }
    }
    setFormData({ ...formData, [attributeName]: attribute });
  }

  function renderMetadataRow(
    label: string,
    value?: string | string[],
    formDataAttribute?: keyof MetadataFormType,
    renderAsEditable?: Function
  ) {
    if (value === undefined || value === null) return <></>;
    const dataList = Array.isArray(value) ? value : [value];
    return (
      <MetadataRow container>
        <Grid item xs={4}>
          <MetadataLabel>{label}:</MetadataLabel>
        </Grid>
        <Grid item xs={8}>
          {renderAsEditable && isEditModeActive && renderAsEditable(label, value, formDataAttribute)}
          {(!isEditModeActive || !renderAsEditable) &&
            dataList.filter((item) => item.trim().length !== 0).map((item) => (
              <MetadataAttribute key={self.crypto.randomUUID()}>
                {item}
              </MetadataAttribute>
            ))}
        </Grid>
      </MetadataRow>
    );
  }

  function renderEditableString(
    label: string,
    value: string,
    formDataAttribute: keyof MetadataFormType
  ) {
    return (
      <TextInput
        labelText={label}
        labelMode={'hidden'}
        onChange={(newValue) =>
          updateFormData(formDataAttribute, newValue)
        }
        value={value}
      />
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

  function renderEditableList(
    label: string,
    valueArray: string[],
    formDataAttribute: keyof MetadataFormType
  ) {
    return (
      <>
        {valueArray.map((item, index) =>
          renderDeletableInput(item, formDataAttribute, index)
        )}
        <Button onClick={() => updateFormData(formDataAttribute)}>
          {formDataAttribute == 'dctCreators'
            ? t('metadata.add-creator')
            : formDataAttribute == 'dctIdentifiers'
              ? t('metadata.add-identifier')
              : ''}
        </Button>
      </>
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
          {renderMetadataRow(t('metadata.name'), formData.label, 'label', renderEditableString)}
          {renderMetadataRow(t('metadata.pid'), metadata.handle ?? t('metadata.not-available'))}
          {renderMetadataRow(
            t('metadata.identifier'),
            formData.dctIdentifiers,
            'dctIdentifiers',
            renderEditableList
          )}
          {renderMetadataRow(
            t('metadata.version-label'),
            formData.versionLabel,
            'versionLabel',
            renderEditableString
          )}
          {!isCrosswalk(metadata) && renderMetadataRow(
            t('metadata.name-space-label'),
            formData.namespace,
            'namespace',
            renderEditableString
          )}

          {renderMetadataRow(
            t('metadata.creator'),
            formData.dctCreators,
            'dctCreators',
            renderEditableList
          )}
          {renderMetadataRow(
            t('metadata.contact'),
            formData.contact,
            'contact',
            renderEditableString
          )}
          {renderMetadataRow(
            t('metadata.domain'),
            formData.domain,
            'domain',
            renderEditableString
          )}
          {renderMetadataRow(
            t('metadata.language'),
            metadata.languages
          )}
          {renderMetadataRow(
            t('metadata.license'),
            formData.dctLicense,
            'dctLicense',
            renderEditableString
          )}
          {renderMetadataRow(
            t('metadata.publisher'),
            formData.dctPublisher,
            'dctPublisher',
            renderEditableString
          )}
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

          {renderMetadataRow(
            t('metadata.source-url'),
            metadata.sourceURL
          )}

          {isCrosswalk(metadata) && (
            <>
              {renderMetadataRow(
                t('metadata.source-schema'),
                metadata.sourceSchemaInfo.name
              )}
              {renderMetadataRow(
                t('metadata.source-schema-id'),
                metadata.sourceSchemaInfo.handle ?? metadata.sourceSchemaInfo.id
              )}
              {renderMetadataRow(
                t('metadata.target-schema'),
                metadata.targetSchemaInfo.name
              )}
              {renderMetadataRow(
                t('metadata.target-schema-id'),
                metadata.targetSchemaInfo.handle ?? metadata.targetSchemaInfo.id
              )}
            </>
          )}

          {renderMetadataRow(
            t('metadata.mscr-owner'),
            metadata.ownerMetadata.map((o) => o.name ?? o.id)
          )}
          {renderMetadataRow(t('metadata.format'), metadata.format)}
          {renderMetadataRow(t('metadata.internal-identifier'), metadata.id)}

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

          {renderMetadataRow(
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
                  value={formData.visibility}
                  onChange={(newValue) =>
                    updateFormData('visibility', newValue)
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
