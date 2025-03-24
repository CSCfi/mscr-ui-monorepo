import { Format } from '@app/common/interfaces/format.interface';
import { Visibility } from '@app/common/interfaces/search.interface';
import { State } from '@app/common/interfaces/state.interface';

export interface Metadata {
  pid: string;
  handle: string;
  label: {
    [key: string]: string;
  };
  description: {
    [key: string]: string;
  };
  languages?: string[];
  format: Format;
  created: string;
  modified: string;
  versionLabel: string;
  contact: string;
  ownerMetadata: [
    {
      id: string;
      name: string;
    }
  ];
  sourceSchema?: string;
  targetSchema?: string;
  prefix?: string;
  fileMetadata?: FileData[];
  sourceURL?: string;
  mscr_namespace?: string;
  mscr_owner?: string[];
  // TODO: Assess if the fields below should be turned compulsory (remove '?') after backend is migrated to v2
  mscr_creator?: string;
  mscr_visibility?: Visibility;
  mscr_state?: State;
  creator?: string[];
  domain?: string;
  identifier?: string[];
  language?: string;
  license?: string;
  publisher?: string;
  fairsharing_doi?: string;
  // TODO: Assess if fields below can be removed when backend migrated to v2
  state?: State;
  visibility?: Visibility;
  namespace?: string;
  owner?: string[];
}

export interface FileData {
  id?: string;
  contentType?: string;
  size?: number;
  fileID: number;
  filename?: string;
}

export interface MetadataFormType {
  label: string;
  description: string;
  contact: string;
  versionLabel: string;
  mscrVisibility: string;
  mscrNamespace: string;
  domain: string;
  language: string;
  license: string;
  publisher: string;
  fairsharingDoi: string;
  creator: string[];
  identifier: string[];
}

export const initialMetadataForm: MetadataFormType = {
  label: '',
  description: '',
  contact: '',
  versionLabel: '',
  mscrVisibility: '',
  mscrNamespace: '',
  domain: '',
  language: '',
  license: '',
  publisher: '',
  fairsharingDoi: '',
  creator: [],
  identifier: []
};
