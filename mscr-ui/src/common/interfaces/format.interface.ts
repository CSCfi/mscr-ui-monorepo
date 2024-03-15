export enum Format {
  Jsonschema = 'JSONSCHEMA',
  Csv = 'CSV',
  Skosrdf = 'SKOSRDF',
  Pdf = 'PDF',
  Xsd = 'XSD',
  Xslt = 'XSLT',
  Shacl = 'SHACL',
  Mscr = 'MSCR',
  Rdfs = 'RDFS'
}

export enum FileExtensions {
  Jsonschema = 'json',
  Csv = 'csv',
  Skosrdf = 'ttl',
  Pdf = 'pdf',
  Xsd = 'xsd',
  Xslt = 'xslt'
}

export const formatsAvailableForCrosswalkCreation: Format[] = [
  Format.Jsonschema,
  Format.Csv,
  Format.Rdfs,
  Format.Skosrdf,
  Format.Xsd,
  Format.Shacl,
];

export const formatsAvailableForCrosswalkRegistration: Format[] = [
  Format.Xslt, Format.Csv, Format.Pdf,
];

export const formatsAvailableForSchemaRegistration: Format[] = [
  Format.Csv,
  Format.Jsonschema,
  Format.Pdf,
  Format.Rdfs,
  Format.Skosrdf,
  Format.Xsd,
];

export const fileExtensionsAvailableForCrosswalkRegistrationAttachments: FileExtensions[] = [
  FileExtensions.Csv, FileExtensions.Xslt, FileExtensions.Pdf
];

export const fileExtensionsAvailableForSchemaRegistration: FileExtensions[] = [
  FileExtensions.Jsonschema, FileExtensions.Csv, FileExtensions.Skosrdf, FileExtensions.Pdf, FileExtensions.Xsd
];

