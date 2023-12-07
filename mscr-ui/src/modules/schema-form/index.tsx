/* eslint-disable */
import {useGetOrganizationsQuery} from '@app/common/components/organizations/organizations.slice';
import {useGetServiceCategoriesQuery} from '@app/common/components/service-categories/service-categories.slice';
import getOrganizations from '@app/common/utils/get-organizations';
import {useTranslation} from 'next-i18next';
import {useMemo} from 'react';
import {Dropdown, DropdownItem} from 'suomifi-ui-components';
import {
    BlockContainer,
    ModelFormContainer,
    WideMultiSelect,
} from './schema-form.styles';
import LanguageSelector from 'yti-common-ui/form/language-selector';
import {FormErrors} from './validate-form';
import {Status} from '@app/common/interfaces/status.interface';
import {FormUpdateErrors} from './validate-form-update';
import {SchemaFormType} from '@app/common/interfaces/schema.interface';

interface SchemaFormProps {
    formData: SchemaFormType;
    setFormData: (value: SchemaFormType) => void;
    userPosted: boolean;
    disabled?: boolean;
    errors?: FormErrors | FormUpdateErrors;
    editMode?: boolean;
}

export default function SchemaForm({
                                       formData,
                                       setFormData,
                                       userPosted,
                                       disabled,
                                       errors,
                                       editMode,
                                   }: SchemaFormProps) {
    const {t, i18n} = useTranslation();
    const {data: serviceCategoriesData} = useGetServiceCategoriesQuery(
        i18n.language
    );
    const {data: organizationsData} = useGetOrganizationsQuery(i18n.language);

    const organizations = useMemo(() => {
        if (!organizationsData) {
            return [];
        }
        // console.log(organizationsData[0].id);
        return getOrganizations(organizationsData, i18n.language)
            .map((o) => ({
                labelText: o.label,
                uniqueItemId: o.id,
            }))
            .sort((o1, o2) => (o1.labelText > o2.labelText ? 1 : -1));
    }, [organizationsData, i18n.language]);

    // Creating the actual schema Input form
    return (
        <ModelFormContainer>
            {renderSchemaFormat()}
            {renderLanguages()}
            {/*!editMode && renderContributors()*/}
            {renderStaus()}
            {/*editMode && renderContributors()*/}
        </ModelFormContainer>
    );

    function renderSchemaFormat() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <Dropdown
                    labelText={t('schema-form.format-label')}
                    visualPlaceholder={t('schema-form.format-placeholder')}
                    defaultValue={formData.format ?? ''}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            format: e,
                        })
                    }
                >
                    <DropdownItem value={'JSONSCHEMA'}>{'JSON'}</DropdownItem>
                    <DropdownItem value={'CSV'}>{'CSV'}</DropdownItem>
                    <DropdownItem value={'PDF'}>{'PDF'}</DropdownItem>
                    <DropdownItem value={'SKOSRDF'}>{'SKOSRDF'}</DropdownItem>
                </Dropdown>
            </div>
        );
    }

    function renderLanguages() {
        return (
            <div>
                <LanguageSelector
                    items={formData.languages}
                    labelText={t('schema-form.information-description-languages')}
                    visualPlaceholder={t('schema-form.information-description-languages-hint-text')}
                    isWide={true}
                    setLanguages={(e) =>
                        setFormData({
                            ...formData,
                            languages: e,
                        })
                    }
                    userPosted={userPosted}
                    translations={{
                        textInput: t('schema-form.name'),
                        textDescription: t('schema-form.description'),
                        optionalText: '',
                    }}
                    allowItemAddition={false}
                    ariaChipActionLabel={''}
                    ariaSelectedAmountText={''}
                    ariaOptionsAvailableText={''}
                    ariaOptionChipRemovedText={''}
                    noItemsText={''}
                    status={errors?.languageAmount ? 'error' : 'default'}
                    disabled={disabled}
                    defaultSelectedItems={formData.languages.filter(
                        (lang: { selected: any }) => lang.selected
                    )}
                />
            </div>
        );
    }

    function renderStaus() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <Dropdown
                    labelText={t('schema-form.status')}
                    visualPlaceholder={t('schema-form.status-select')}
                    defaultValue={''}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            status: e as Status | undefined,
                        })
                    }
                >
                    <DropdownItem value={'DRAFT'}>{'DRAFT'}</DropdownItem>
                    <DropdownItem value={'PUBLISHED'}>{'PUBLISHED'}</DropdownItem>
                    <DropdownItem value={'DEPRECATED'}>{'DEPRECATED'}</DropdownItem>
                </Dropdown>
            </div>
        );
    }

    function renderContributors() {
        return (
            <WideMultiSelect
                chipListVisible={true}
                labelText={t('schema-form.contributors')}
                visualPlaceholder={t('schema-form.contributors-select')}
                removeAllButtonLabel={t('schema-form.contributors-clear-all-selections')}
                allowItemAddition={false}
                onItemSelectionsChange={(e) =>
                    setFormData({
                        ...formData,
                        organizations: e,
                    })
                }
                items={formData.organizations}
                status={
                    'default'
                    /* Old value below, can it be perma-removed? (leftover from https://github.com/CSCfi/mscr-ui-monorepo/pull/17)
                    {userPosted && errors?.organizations ? 'error' : 'default'}*/}
                ariaChipActionLabel={''}
                ariaSelectedAmountText={''}
                ariaOptionsAvailableText={''}
                ariaOptionChipRemovedText={''}
                noItemsText={''}
            />
        );
    }
}
