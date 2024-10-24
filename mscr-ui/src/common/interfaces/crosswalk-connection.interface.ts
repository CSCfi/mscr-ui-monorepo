export interface CrosswalkConnection {
    source: string;
    target: string | string[];
    sourceTitle: string | undefined;
    targetTitle: string | undefined;
    sourceType: string | undefined;
    targetType: string | undefined;
    parentId: number | string;
    parentName: string | undefined;
    mappingType: string | undefined;
    notes: string | undefined;
    isSelected: boolean;
    sourceDescription: string | undefined;
    type: string | undefined;
}

export interface RenderTreeOld {
    idNumeric: number;
    id: string;
    name: string;
    isLinked: boolean;
    title?: string;
    type?: string;
    description?: string;
    required?: string;
    isMappable?: string;
    parentName?: string;
    jsonPath: string;
    parentId: number | string;
    children?: RenderTreeOld[];
}

export interface RenderTree {
    name: string;
    qname: string;
    visualTreeId: string;
    id: string;
    properties: any;
    elementPath: string;
    parentElementPath: string | undefined;
    children: RenderTree[];
    uri: string;
}

export interface CrosswalkConnectionNew {
    source: RenderTree;
    target: RenderTree;
    id: string;
    notes: string | undefined;
    predicate: string;
    processing: any;
    isSelected: boolean;
    isDraft: boolean;
    sourceJsonPath: string | undefined;
    targetJsonPath: string | undefined;
    sourcePredicate: string | undefined;
    sourceProcessing?: { id: string; params: any };
    targetPredicate: string | undefined;
    targetProcessing?: { id: string; params: any };
}

export interface NodeListingRow {
    name: string;
    type: string;
    description: string;
    id: string;
    notes: string | undefined;
    isSelected: boolean;
    processingSelection?: string;
    processing?: { id: string; params: any };
}

export interface CrosswalkConnectionsNew {
    source: RenderTree[];
    target: RenderTree[];
    id: string;
    description: string | undefined;
}

export interface NodeMapping {
    isPartOf?: string;
    id?: string;
    depends_on?: string[];
    source: { processing?: { id: string; params: any }; id: string; label: string; uri: string }[];
    sourceType?: string;
    sourceDescription?: string;
    predicate: string;
    filter?: { path: string; distinctValues: boolean; value: {}; operator: string };
    target: { processing?: { id: string; params: any }; id: string; label: string; uri: string }[];
    targetType?: string;
    targetDescription?: string;
    processing?: { id: string; params: any };
    oneOf?: { filter: { path: string; distinctValues: boolean; value: {}; operator: string } }[];
    pid?: string;
    notes?: string;
}

