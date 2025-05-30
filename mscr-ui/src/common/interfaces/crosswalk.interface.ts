import { LanguageBlockType } from 'yti-common-ui/form/language-selector';
import { State } from '@app/common/interfaces/state.interface';
import { ContentRevision } from '@app/common/interfaces/content-revision.interface';
import { Metadata } from '@app/common/interfaces/metadata.interface';
import { Format } from '@app/common/interfaces/format.interface';

export interface Crosswalk extends Metadata {
  sourceSchema: string;
  sourceSchemaInfo: SchemaSummary;
  targetSchema: string;
  targetSchemaInfo: SchemaSummary;
  generatedFileMetadata: GeneratedFile[];
  subType: SubType;
}

export interface CrosswalkWithVersionInfo extends Crosswalk {
  revisions: ContentRevision[];
}

interface SchemaSummary {
  id: string;
  handle: string;
  name: string;
  versionLabel: string;
  versionIndex: number;
  format: Format;
}

export interface CrosswalkFormType {
  format: Format;
  state: State;
  languages: (LanguageBlockType & { selected: boolean })[];
  sourceSchema: string;
  targetSchema: string;
  versionLabel?: string;
}

export interface CrosswalkFormMockupType {
  pid?: string;
  format: string;
  status?: string | undefined;
  state: string | undefined;
  label: any;
  description?: any;
  languages: any;
  organizations: any;
  sourceSchema: string;
  targetSchema: string;
  namespace?: string;
  versionLabel?: string;
}

export interface GeneratedFile {
  name: string;
  format: string;
  url: string;
}

export interface FilesRow {
  name: any;
  added: any;
  format: any;
  file: any;
}

export enum SubType {
  SemanticMapping = 'SEMANTIC_MAPPING',
  SemanticAnnotation = 'SEMANTIC_ANNOTATION',
  DataCrosswalk = 'DATA_CROSSWALK'
}
