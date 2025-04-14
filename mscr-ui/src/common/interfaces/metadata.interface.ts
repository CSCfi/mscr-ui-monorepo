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
  languages: string[];
  format: Format;
  visibility: Visibility;
  state: State;
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
  owner: string[];
  prefix?: string;
  fileMetadata?: FileData[];
  sourceURL?: string;
  domain: string;
  dctCreators: string[];
  dctIdentifiers: string[];
  dctLicense: string;
  dctPublisher: string;
  // Below fields are in the metadata model but not in use in UI yet
  dctContributors?: string[];
  dctIssued?: string;
  dctRelations?: string[];
  dcatKeywords?: string[];
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
  visibility: string;
  domain: string;
  dctCreators: string[];
  dctIdentifiers: string[];
  dctLicense: string;
  dctPublisher: string;
  namespace: string; // Schemas only
  // Below properties are accepted by endpoint, but not present or not editable in UI metadata form
  status?: string;
  format?: string;
  language?:string;
  dctContributors?: string[];
  dctIssued?: string;
  dctRelations?: string[];
  dcatKeywords?: string[];
}

export const initialMetadataForm: MetadataFormType = {
  contact: '',
  dctCreators: [],
  dctIdentifiers: [],
  dctLicense: '',
  dctPublisher: '',
  description: '',
  domain: '',
  label: '',
  versionLabel: '',
  visibility: '',
  namespace: ''
};
