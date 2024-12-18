import { Format } from '@app/common/interfaces/format.interface';

export enum Type {
  Crosswalk = 'CROSSWALK',
  Schema = 'SCHEMA',
}

export enum SubType {
  Schema,
  Vocabulary,
  Ontology,
  Crosswalk,
  Mapping,
  Annotation,
}

export const formatsRelatedToSubtype = {
  0: [Format.Csv, Format.Xsd, Format.Jsonschema, Format.Shacl],
  1: [Format.Skosrdf, Format.Enum],
  2: [Format.Rdfs, Format.Owl],
  3: [Format.Csv, Format.Xsd, Format.Jsonschema, Format.Shacl],
  4: [Format.Skosrdf, Format.Rdfs, Format.Owl],
  5: [Format.Csv, Format.Xsd, Format.Jsonschema,]
};

// Leftover from codebase
export type DatamodelType = 'LIBRARY' | 'PROFILE';
