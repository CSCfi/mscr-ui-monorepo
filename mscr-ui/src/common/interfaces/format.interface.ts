export enum Format {
  Jsonschema = 'JSONSCHEMA',
  Csv = 'CSV',
  Skosrdf = 'SKOSRDF',
  Pdf = 'PDF',
  Xsd = 'XSD',
  Xml = 'XML',
  Xslt = 'XSLT',
  Shacl = 'SHACL',
  Mscr = 'MSCR',
}

export enum FileExtensions {
  Jsonschema = 'json',
  Csv = 'csv',
  Skosrdf = 'ttl',
  Pdf = 'pdf',
  Xml = 'xml',
  Xsd = 'xsd',
}

['json', 'csv', 'pdf', 'ttl', 'xml', 'xsd']

export const formatsAvailableForCrosswalkCreation: Format[] = [
  Format.Jsonschema,
  Format.Csv,
  Format.Skosrdf,
  Format.Xsd,
  Format.Shacl,
];

export const formatsAvailableForCrosswalkRegistration: Format[] = [
  Format.Xslt, Format.Csv, Format.Pdf,
];

export const fileExtensionsAvailableForSchemaRegistration: FileExtensions[] = [
  FileExtensions.Jsonschema, FileExtensions.Csv, FileExtensions.Skosrdf, FileExtensions.Pdf, FileExtensions.Xml, FileExtensions.Xsd
];