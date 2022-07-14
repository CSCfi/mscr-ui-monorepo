import { SSRConfig, useTranslation } from 'next-i18next';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import Layout from '@app/layouts/layout';
import {
  createCommonGetServerSideProps,
  LocalHandlerParams,
} from '@app/common/utils/create-getserversideprops';
import Concept from '@app/modules/concept';
import {
  getConcept,
  getRunningOperationPromises as getConceptRunningOperationPromises,
} from '@app/common/components/concept/concept.slice';
import {
  getVocabulary,
  getRunningOperationPromises as getVocabularyRunningOperationPromises,
} from '@app/common/components/vocabulary/vocabulary.slice';
import {
  CommonContextState,
  CommonContextProvider,
} from '@app/common/components/common-context-provider';
import PageHead from '@app/common/components/page-head';
import { getPropertyValue } from '@app/common/components/property-value/get-property-value';
import { getProperty } from '@app/common/utils/get-property';
import { getStoreData } from '@app/common/components/page-head/utils';

interface ConceptPageProps extends CommonContextState {
  _netI18Next: SSRConfig;
  conceptDescription: string;
  conceptTitle: string;
  vocabularyTitle: string;
}

export default function ConceptPage(props: ConceptPageProps) {
  const { t } = useTranslation('common');
  const { query, asPath } = useRouter();
  const terminologyId = (query?.terminologyId ?? '') as string;
  const conceptId = (query?.conceptId ?? '') as string;

  return (
    <CommonContextProvider value={props}>
      <Layout
        feedbackSubject={`${t('feedback-concept')} - ${props.conceptTitle}`}
      >
        <PageHead
          title={[props.conceptTitle, props.vocabularyTitle]}
          description={props.conceptDescription}
          path={asPath}
        />

        <Concept terminologyId={terminologyId} conceptId={conceptId} />
      </Layout>
    </CommonContextProvider>
  );
}

export const getServerSideProps = createCommonGetServerSideProps(
  async ({ store, params, locale }: LocalHandlerParams) => {
    const terminologyId = Array.isArray(params.terminologyId)
      ? params.terminologyId[0]
      : params.terminologyId;
    const conceptId = Array.isArray(params.conceptId)
      ? params.conceptId[0]
      : params.conceptId;

    if (terminologyId === undefined || conceptId === undefined) {
      throw new Error('Invalid parameters for page');
    }

    store.dispatch(getVocabulary.initiate({ id: terminologyId }));
    store.dispatch(getConcept.initiate({ terminologyId, conceptId }));

    await Promise.all(getVocabularyRunningOperationPromises());
    await Promise.all(getConceptRunningOperationPromises());

    const vocabularyData = getStoreData({
      state: store.getState(),
      reduxKey: 'vocabularyAPI',
      functionKey: 'getVocabulary',
    });

    const conceptData = getStoreData({
      state: store.getState(),
      reduxKey: 'conceptAPI',
      functionKey: 'getConcept',
    });

    const vocabularyTitle = getPropertyValue({
      property: vocabularyData?.properties?.prefLabel,
      language: locale,
      fallbackLanguage: 'fi',
    });

    const conceptTitle = getPropertyValue({
      property: getProperty('prefLabel', conceptData?.references.prefLabelXl),
      language: locale,
      fallbackLanguage: 'fi',
    });

    const conceptDescription = getPropertyValue({
      property: conceptData?.properties.definition,
      language: locale,
      fallbackLanguage: 'fi',
    });

    return {
      props: {
        conceptDescription: conceptDescription,
        conceptTitle: conceptTitle,
        vocabularyTitle: vocabularyTitle,
      },
    };
  }
);
