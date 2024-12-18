import { Status } from './status.interface';
import { DatamodelType } from './type.interface';

export interface DataModel {
  comment: {
    [key: string]: string;
  };
  contentModified: string;
  contributor: string[];
  created: string;
  documentation: {
    [key: string]: string;
  };
  id: string;
  isPartOf: string[];
  label: {
    [key: string]: string;
  };
  language: string[];
  modified: string;
  prefix: string;
  status: Status;
  type: DatamodelType;
}
