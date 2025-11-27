import SchemaInfo from '@app/common/components/schema-info';
import { useTranslation } from 'next-i18next';
import {
  Format,
  formatsAvailableForCrosswalkCreation,
} from '@app/common/interfaces/format.interface';
import SchemaInfo2 from '@app/common/components/schema-info2';

export default function SchemaVisualization({
  pid,
  format,
  isNodeEditable,
  hasCustomRoot,
}: {
  pid: string;
  format: Format;
  isNodeEditable: boolean;
  hasCustomRoot: boolean;
}) {
  const { t } = useTranslation('common');
  const filterLabel = t('schema-tree.search-schema');
  const visualizationAvailable =
    formatsAvailableForCrosswalkCreation.includes(format);
  if (visualizationAvailable) {
    return (
      <SchemaInfo2
        caption={filterLabel}
        schemaUrn={pid}
        isSingleTree={true}
        isNodeEditable={isNodeEditable}
        hasCustomRoot={hasCustomRoot}
      />
    );
  } else {
    return (
      <>
        <h2>{t('schema-tree.error-heading')}</h2>
        <p>{t('schema-tree.error-info')}</p>
      </>
    );
  }
}
