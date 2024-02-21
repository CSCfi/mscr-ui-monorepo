import { useEffect, useState } from 'react';
import { Paragraph, Text } from 'suomifi-ui-components';
import ContactInfo from '@app/common/components/terminology-components/contact-info';
import InformationDomainsSelector from '@app/common/components/terminology-components/information-domains-selector';
import { TallerSeparator } from './new-terminology.styles';
import Prefix from 'yti-common-ui/form/prefix';
import TypeSelector from '@app/common/components/terminology-components/type-selector';
import { NewTerminologyInfo } from '@app/common/interfaces/new-terminology-info';
import { useTranslation } from 'next-i18next';
import { TerminologyDataInitialState } from './terminology-initial-state';
import { UpdateTerminology } from './update-terminology.interface';
import StatusSelector from './status-selector';
import isEmail from 'validator/lib/isEmail';
import { useGetIfNamespaceInUseMutation } from '@app/common/components/vocabulary/vocabulary.slice';
import LanguageSelector, {
  LanguageBlockType,
} from 'yti-common-ui/form/language-selector';

interface InfoManualProps {
  setIsValid: (valid: boolean) => void;
  setManualData: (object: NewTerminologyInfo) => void;
  userPosted: boolean;
  initialData?: NewTerminologyInfo;
  onChange: () => void;
  disabled?: boolean;
}

export default function InfoManual({
  setIsValid,
  setManualData,
  userPosted,
  initialData,
  onChange,
  disabled,
}: InfoManualProps) {
  const { t, i18n } = useTranslation('admin');
  const [terminologyData, setTerminologyData] = useState<NewTerminologyInfo>(
    initialData ? initialData : TerminologyDataInitialState
  );
  /*
  const { data: languages } = useGetCodesQuery({
    registry: 'interoperabilityplatform',
    codeScheme: 'languagecodes',
  });
  */
  const languages = { results: [] };
  const [languageList, setLanguageList] = useState<LanguageBlockType[]>([
    {
      labelText: 'en',
      uniqueItemId: 'en',
      title: '',
      description: '',
      selected: true,
    },
  ]);

  useEffect(() => {
    if (!terminologyData) {
      return;
    }
    console.log(terminologyData);

    let valid = true;

    if (Object.keys(terminologyData).length < 6) {
      valid = false;
    } else {
      Object.entries(terminologyData).forEach(([key, value]) => {
        if (key === 'contact' && value !== '' && !isEmail(value)) {
          valid = false;
        }

        if (
          key !== 'contact' &&
          (!value || value.length < 1 || value[1] === false)
        ) {
          valid = false;
        }

        if (
          key === 'languages' &&
          (!value ||
            value.length < 1 ||
            value.some((v: LanguageBlockType) => !v.title))
        ) {
          valid = false;
        }
      });
    }
    setIsValid(valid);
    setManualData(terminologyData);
  }, [terminologyData, setIsValid, setManualData, languages]);

  const handleUpdate = ({ key, data }: UpdateTerminology) => {
    console.log('after update' + key);
    setTerminologyData((values) => ({ ...values, [key]: data }));
    onChange();
  };

  return (
    <form>
      <LanguageSelector
        items={languageList}
        labelText={t('information-description-languages')}
        hintText={t('information-description-languages-hint-text')}
        visualPlaceholder={t('select-information-description-languages')}
        isWide={true}
        defaultSelectedItems={languageList}
        setLanguages={(value) => {
          const selectedItems = value.filter((v) => v.selected);
          const selectedIds = selectedItems.map((i) => i.uniqueItemId);
          const updatedList = languageList.map((item) => {
            if (selectedIds.includes(item.uniqueItemId)) {
              const selected = selectedItems.find(
                (v) => v.uniqueItemId === item.uniqueItemId
              );
              return {
                ...item,
                title: selected?.title ?? '',
                description: selected?.description ?? '',
                selected: true,
              };
            }
            return {
              ...item,
              selected: false,
            };
          });

          setLanguageList(updatedList);
          handleUpdate({
            key: 'languages',
            data: selectedItems,
          });
        }}
        userPosted={userPosted}
        translations={{
          textInput: t('language-input-text'),
          textDescription: t('description'),
          optionalText: t('optional'),
        }}
        allowItemAddition={false}
        ariaChipActionLabel={''}
        ariaSelectedAmountText={''}
        ariaOptionsAvailableText={''}
        ariaOptionChipRemovedText={''}
        noItemsText={''}
        disabled={disabled}
      />

      {/*  <InformationDomainsSelector
        disabled={disabled}
        update={handleUpdate}
        userPosted={userPosted}
        initialData={initialData}
      /> */}

      <Prefix
        prefix={terminologyData.prefix[0]}
        setPrefix={(value) =>
          handleUpdate({
            key: 'prefix',
            data: [value, true],
          })
        }
        inUseMutation={useGetIfNamespaceInUseMutation}
        typeInUri={'terminology'}
        error={false}
        translations={{
          automatic: t('automatic-prefix'),
          errorInvalid: t('prefix-invalid'),
          errorTaken: t('prefix-taken'),
          hintText: t('prefix-hint'),
          label: t('prefix'),
          manual: t('manual-prefix'),
          textInputHint: '',
          textInputLabel: t('prefix'),
          uriPreview: t('url-preview'),
        }}
      />

      {/* <TallerSeparator /> */}
      {/*   <ContactInfo
        disabled={disabled}
        update={handleUpdate}
        userPosted={userPosted}
        defaultValue={initialData?.contact}
      /> */}
    </form>
  );
}
