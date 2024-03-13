import { useGetAuthenticatedUserQuery } from '@app/common/components/login/login.slice';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  IconPlus,
  InlineAlert,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
  Text,
} from 'suomifi-ui-components';
import { useBreakpoints } from 'yti-common-ui/components/media-query';
import { FormErrors, validateSchemaForm } from './validate-schema-form';
import FormFooterAlert from 'yti-common-ui/components/form-footer-alert';
import { translateFileUploadError } from '@app/common/utils/translation-helpers';
import { useTranslation } from 'next-i18next';
import generateSchemaPayload from './generate-schema-payload';
import getApiError from '@app/common/utils/getApiErrors';
import { useRouter } from 'next/router';
import HasPermission from '@app/common/utils/has-permission';
import { useInitialSchemaForm } from '@app/common/utils/hooks/use-initial-schema-form';
import { usePutSchemaFullMutation } from '@app/common/components/schema/schema.slice';
import SchemaFormFields from './schema-form-fields';
import FileDropArea from 'yti-common-ui/components/file-drop-area';
import Separator from 'yti-common-ui/components/separator';
import getErrors from '@app/common/utils/get-errors';
import {fileExtensionsAvailableForSchemaRegistration} from '@app/common/interfaces/format.interface';

interface SchemaFormModalProps {
  refetch: () => void;
}

// For the time being, using as schema metadata form, Need to update the props accordingly

export default function SchemaFormModal({ refetch }: SchemaFormModalProps) {
  const { t } = useTranslation('admin');
  const { isSmall } = useBreakpoints();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [, setIsValid] = useState(false);
  const [schemaFormInitialData] = useState(useInitialSchemaForm());
  const [formData, setFormData] = useState(schemaFormInitialData);
  const [fileData, setFileData] = useState<File | null>();
  const [fileUri, setFileUri] = useState<string | null>();
  const [errors, setErrors] = useState<FormErrors>();
  const [skip, setSkip] = useState(true);
  const { data: authenticatedUser } = useGetAuthenticatedUserQuery(undefined, {
    skip,
  });
  const [userPosted, setUserPosted] = useState(false);
  // Why are we using a mutation here? Why is that even implemented as a mutation, when the method is GET?
  const [putSchemaFull, resultSchemaFull] = usePutSchemaFullMutation();

  const handleOpen = () => {
    setSkip(false);
    setVisible(true);
  };

  const handleClose = useCallback(() => {
    setVisible(false);
    setSkip(true);
    setUserPosted(false);
    setFormData(schemaFormInitialData);
    setFileData(null);
    setFileUri(null);
  }, [schemaFormInitialData]);

  useEffect(() => {
    if (userPosted && resultSchemaFull.isSuccess) {
      //Get the pid from the result
      handleClose();
      if (resultSchemaFull && resultSchemaFull.data.pid) {
        router.push(`/schema/${resultSchemaFull.data.pid}`);
      }

      // After post route to  saved schema get by PID
      // Later we should show the created schema in the list
    }
  }, [resultSchemaFull, refetch, userPosted, handleClose, router, formData]);

  const handleSubmit = () => {
    setUserPosted(true);
    if (!formData) {
      return;
    }
    const errors = validateSchemaForm(formData, fileData, fileUri);
    setErrors(errors);

    if (Object.values(errors).includes(true)) {
      return;
    }

    const payload = generateSchemaPayload(formData);
    const schemaFormData = new FormData();
    schemaFormData.append('metadata', JSON.stringify(payload));
    if (fileUri && fileUri.length > 0) {
      schemaFormData.append('contentURL', fileUri);
      putSchemaFull(schemaFormData);
    }
    else if (fileData) {
      schemaFormData.append('file', fileData);
      putSchemaFull(schemaFormData);
    } else {
      return;
    }
  };

  useEffect(() => {
    if (!userPosted) {
      return;
    }
    const errors = validateSchemaForm(formData, fileData, fileUri);
    setErrors(errors);
    //console.log(errors);
  }, [userPosted, formData, fileData]);

  // Need to add action type create_schema
  if (!HasPermission({ actions: ['CREATE_SCHEMA'] })) {
    return null;
  }

  function gatherErrorMessages() {
    const inputErrors = getErrors(t, errors);
    if (resultSchemaFull.isError) {
      const errorMessage = getApiError(resultSchemaFull.error);
      return [...inputErrors, errorMessage];
    }
    return inputErrors;
  }

  return (
    <>
      <Button
        variant="secondary"
        icon={<IconPlus />}
        style={{ height: 'min-content' }}
        onClick={() => handleOpen()}
      >
        {t('register-schema')}
      </Button>

      <Modal
        appElementId="__next"
        visible={visible}
        onEscKeyDown={() => handleClose()}
        variant={isSmall ? 'smallScreen' : 'default'}
      >
        <ModalContent>
          <ModalTitle>{t('register-schema')}</ModalTitle>

          <FileDropArea
            setFileData={setFileData}
            setIsValid={setIsValid}
            validFileTypes={fileExtensionsAvailableForSchemaRegistration}
            translateFileUploadError={translateFileUploadError}
            isSchemaUpload={true}
            setFileUri={setFileUri}/>
          <br></br>

          <SchemaFormFields
            formData={formData}
            setFormData={setFormData}
            userPosted={userPosted}
            disabled={authenticatedUser && authenticatedUser.anonymous}
            errors={userPosted ? errors : undefined}
          />
          <Separator></Separator>

        </ModalContent>
        <ModalFooter>
          {authenticatedUser && authenticatedUser.anonymous && (
            <InlineAlert status="error" role="alert" id="unauthenticated-alert">
              {t('error-unauthenticated')}
            </InlineAlert>
          )}
          {userPosted && (
            <FormFooterAlert
              labelText={'Something went wrong'}
              alerts={gatherErrorMessages()}
            />
          )}

          <Button onClick={() => handleSubmit()}>{t('register-schema')}</Button>
          <Button variant="secondary" onClick={() => handleClose()}>
            {t('cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
