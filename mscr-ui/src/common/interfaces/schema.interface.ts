import { State } from '@app/common/interfaces/state.interface';
import { Format } from '@app/common/interfaces/format.interface';
import { LanguageBlockType } from 'yti-common-ui/components/form/language-selector';
import { ContentRevision } from '@app/common/interfaces/content-revision.interface';

export interface Schema {
  namespace?: string;
  pid?: string;
  format?: string;
  // TODO: Change all mentions of 'status' into 'state'
  status?: string;
  state?: string;
  label?: {
    [key: string]: string;
  };
  description: {
    [key: string]: string;
  };
  languages?: string[];
  organizations: Organization[];
  filedata?: File;
  prefix?: string;
  revision?: string;
  visibility?: string;
  created?: string;
  modified: string;
  uri?: string;
  versionLabel?: string;
}

export interface SchemaWithVersionInfo extends Schema {
  revisions: ContentRevision[];
  fileMetadata?: SchemaFileData[];
}

export interface SchemaFileData {
  id?: string;
  contentType?: string;
  size?: number;
  fileID?: number;
  name?: string;
}

export interface Organization {
  id: string;
  parentOrganization?: string;
  label: { [key: string]: string };
}

// ToDo: Proper typing
export interface SchemaFormType {
  namespace?: string;
  pid?: string;
  format: Format;
  languages: (LanguageBlockType & { selected: boolean })[];
  organizations: Organization[];
  filedata?: any;
  state: State;
}

export interface FilesRowInput {
  filename: string;
  fileID: string;
  contentType: string;
  size: string;
}
