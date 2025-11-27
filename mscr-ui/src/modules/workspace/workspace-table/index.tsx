import { useTranslation } from 'next-i18next';
import { Type } from '@app/common/interfaces/search.interface';
import GenericTable from '@app/common/components/generic-table';
import { State } from '@app/common/interfaces/state.interface';
import useUrlState from '@app/common/utils/hooks/use-url-state';
import { TextInput } from 'suomifi-ui-components';

export interface ContentRow {
  label: string;
  //namespace?: string;
  state: State;
  numberOfRevisions: string;
  pid: string;
  linkUrl: JSX.Element;
}

type TextInputValue = string | number | undefined;

export default function WorkspaceTable({
  content,
  contentType,
  searchParameter,
  setSearchParameter,
}: {
  content: ContentRow[];
  contentType: Type;
  searchParameter: string;
  setSearchParameter: Function;
}) {
  const { patchUrlState } = useUrlState();
  const { t } = useTranslation('common');

  const caption =
    contentType == Type.Schema
      ? t('workspace.schemas')
      : t('workspace.crosswalks');

  const noResults =
    contentType == Type.Schema
      ? t('workspace.no-schemas')
      : t('workspace.no-crosswalks');

  const headings = [
    t('workspace.label'),
    // ...((contentType == Type.Schema) ? [t('workspace.namespace')] : []),
    t('workspace.state'),
    t('workspace.numberOfRevisions'),
    t('workspace.pid'),
    t('metadata.format'),
    '',
  ];

  function updateSearchParameter(e: TextInputValue) {
    let param = '';
    if (e) {
      param = e.toString();
    }
    if (param !== searchParameter) {
      setSearchParameter(param);
      patchUrlState({ page: 1 });
    }
  }

  function renderSearchInput() {
    const label =
      contentType == Type.Schema
        ? t('workspace.search.schemas')
        : t('workspace.search.crosswalks');
    return (
      <TextInput
        labelText={label}
        onChange={(e) => updateSearchParameter(e)}
        visualPlaceholder={t('search.bar.placeholder')}
      />
    );
  }

  return (
    <GenericTable
      items={content}
      headings={headings}
      caption={caption}
      noResultsInfo={noResults}
      searchInput={renderSearchInput}
    />
  );
}
