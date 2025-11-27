export enum ContentTab {
  Metadata = 0,
  Editor,
  Mapping,
  History,
}

export const SchemaTabs = {
  'metadata-and-files-tab': ContentTab.Metadata,
  'content-and-editor-tab': ContentTab.Editor,
  'history-tab': ContentTab.History,
} as const;

export const CrosswalkTabs = {
  'metadata-and-files-tab': ContentTab.Metadata,
  'content-and-editor-tab': ContentTab.Editor,
  'mapping-accordion-tab': ContentTab.Mapping,
  'history-tab': ContentTab.History,
} as const;

export type CrosswalkTabText = keyof typeof CrosswalkTabs;

export type CrosswalkTabIndex = typeof CrosswalkTabs[CrosswalkTabText];

export type SchemaTabText = keyof typeof SchemaTabs;

export type SchemaTabIndex = typeof SchemaTabs[SchemaTabText];
