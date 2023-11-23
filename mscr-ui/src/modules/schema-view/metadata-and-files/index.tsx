import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { Schema } from '@app/common/interfaces/schema.interface';
import router from 'next/router';
import {
  DescriptionList,
  DescriptionListTitle
} from '@app/modules/schema-view/metadata-and-files/metadata-and-files.styles';
import { Grid } from '@mui/material';
import { Heading } from 'suomifi-ui-components';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import getOrganizations from '@app/common/utils/get-organizations';

export default function MetadataAndFiles({ schemaDetails }: { schemaDetails?: Schema }) {
  const { t } = useTranslation('common');
  const lang = router.locale ?? '';

  // TODO: Editing -> Only edit with permission, we have util has-permission

  interface SchemaDisplay {
    [key:string]: string;
  }
  const schemaDisplay : SchemaDisplay = useMemo(() => {
    if (!schemaDetails) {
      return (
        {
          schemaPid: '',
          schemaLabel: '',
          schemaDescription: '',
          schemaCreated: '',
          schemaModified: '',
          schemaState: '',
          schemaOrganizations: '',
          schemaVisibility: '',
          schemaFormat: '',
          schemaVersionLabel: '',
          schemaNamespace: ''
        }
      );
    }
    const organizations = getOrganizations(schemaDetails.organizations, lang)
      .map((org) => org.label).join(', ');
    return (
      {
        schemaPid: schemaDetails?.pid ?? '',
        schemaLabel: schemaDetails?.label
          ? getLanguageVersion({ data: schemaDetails.label, lang, appendLocale: true })
          : '',
        schemaDescription: schemaDetails?.description
          ? getLanguageVersion({ data: schemaDetails.description, lang, appendLocale: true  }) ?? ''
          : '',
        schemaCreated: schemaDetails?.created ?? '',
        schemaModified: schemaDetails?.modified ?? '',
        schemaState: schemaDetails?.state ?? '',
        schemaOrganizations: organizations,
        schemaVisibility: schemaDetails?.visibility ?? '',
        schemaFormat: schemaDetails?.format ?? '',
        schemaVersionLabel: schemaDetails?.versionLabel ?? '',
        schemaNamespace: schemaDetails?.namespace ?? ''
      }
    );
  }, [schemaDetails, lang]);

  return (
    <>
      <Heading variant='h2'>{t('schema.metadata')}</Heading>
      <DescriptionList>
        <Grid container spacing={2}>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.name')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaLabel}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.description')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaDescription}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.pid')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaPid}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.version')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaVersionLabel}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.created')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaCreated}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.modified')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaModified}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.state')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaState}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.visibility')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaVisibility}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.format')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaFormat}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.namespace')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaNamespace}
            </dd>
          </Grid>

          <Grid item xs={2}>
            <DescriptionListTitle>
              {t('schema.organizations')}
            </DescriptionListTitle>
          </Grid>
          <Grid item xs={10}>
            <dd>
              {schemaDisplay.schemaOrganizations}
            </dd>
          </Grid>

        </Grid>
      </DescriptionList>
      <div>TABLE HERE{/* TODO: Display schema files */}</div>
    </>
  );
}
