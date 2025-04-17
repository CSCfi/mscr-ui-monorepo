import { useTranslation } from 'next-i18next';
import { Type } from '@app/common/interfaces/search.interface';
import GenericTable from '@app/common/components/generic-table';
import { State } from '@app/common/interfaces/state.interface';
import useUrlState from "@app/common/utils/hooks/use-url-state";
import {TextInput} from "suomifi-ui-components";

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
  searchParameter: string,
  setSearchParameter: Function;
}) {
  const { patchUrlState } = useUrlState();
  const { t } = useTranslation('common');

  const caption =
    contentType == Type.Schema
      ? t('workspace.schemas')
      : t('workspace.crosswalks');

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
    console.log('param=' + param + ', searchParameter=' + searchParameter);
    if (param !== searchParameter) {
      console.log('setting searchParam');
      setSearchParameter(param);
      patchUrlState({ page: 1 });
    }
  }

  return <div>
    <TextInput onChange={(e) => updateSearchParameter(e)} placeholder={t('search.bar.placeholder')} labelText={""}></TextInput>
    <GenericTable items={content} headings={headings} caption={caption}/>
    </div>;
}
