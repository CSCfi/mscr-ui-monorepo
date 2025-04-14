import { State } from '@app/common/interfaces/state.interface';
import { Format } from '@app/common/interfaces/format.interface';
import { LanguageBlockType } from 'yti-common-ui/components/form/language-selector';
import { ContentRevision } from '@app/common/interfaces/content-revision.interface';
import { Metadata } from '@app/common/interfaces/metadata.interface';

export interface Schema extends Metadata {
  namespace: string;
}

export interface SchemaWithContent {
  metadata: Schema;
  content: {
    tree: unknown;
    definitions: unknown;
  };
}

export interface SchemaWithVersionInfo extends Schema {
  revisions: ContentRevision[];
  customRoot?: string;
}

// ToDo: Proper typing
export interface SchemaFormType {
  namespace?: string;
  format: Format;
  languages: (LanguageBlockType & { selected: boolean })[];
  filedata?: any;
  state: State;
  versionLabel?: string;
}

export interface FilesRowInput {
  filename: string;
  fileID: string;
  contentType: string;
  size: string;
}
