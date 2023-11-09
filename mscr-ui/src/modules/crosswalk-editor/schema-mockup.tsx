import React, {useState} from 'react';
import {cloneDeep} from 'lodash';
import {RenderTree} from "@app/common/interfaces/crosswalk-connection.interface";
import {Checkbox} from "suomifi-ui-components";

const functionsMockup: any = [{
    name: "vocabularyMapperFunc",
    uri: "http://uri.suomi.fi/datamodel/ns/mscr#vocabularyMapperFunc",
    description: "",
    parameters: [
        {
            name: "input",
            datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
            required: true
        },
        {
            name: "params map",
            datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
            required: false
        }
    ],
    outputs: [
        {
            name: "object output",
            datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
            required: true
        }
    ]
},
    {
        name: "Function ",
        uri: "http://uri.suomi.fi/datamodel/ns/mscr#pickPropertyFunc",
        description: "",
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        outputs: [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        name: "Function to copy string value as it is with one to one mapping",
        uri: "http://uri.suomi.fi/datamodel/ns/mscr#stringToStringFunc",
        description: "",
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
                required: true
            }
        ],
        outputs: [
            {
                name: "string output",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
                required: true
            }
        ]
    },
    {
        name: "Function to parse integer from string input",
        uri: "http://uri.suomi.fi/datamodel/ns/mscr#stringToIntFunc",
        description: "",
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
                required: true
            }
        ],
        outputs: [
            {
                name: "int output",
                datatype: "http://www.w3.org/2001/XMLSchema#integer",
                required: true
            }
        ]
    },
    {
        name: 'Function to...',
        uri: `http://uri.suomi.fi/datamodel/ns/mscr#propertiesToArrayFunc`,
        description: '',
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                "name": "params map",
                "datatype": "http://www.w3.org/2001/XMLSchema#anySimpleType",
                "required": false
            }
        ],
        "outputs": [
            {
                "name": "object output",
                "datatype": "http://www.w3.org/2001/XMLSchema#anySimpleType",
                "required": true
            }
        ]
    },
    {
        "name": "Function to...",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#stringToXmlObjectFunc",
        "description": "",
        "parameters": [
            {
                "name": "input",
                "datatype": "http://www.w3.org/2001/XMLSchema#anySimpleType",
                "required": true
            },
            {
                "name": "params map",
                "datatype": "http://www.w3.org/2001/XMLSchema#anySimpleType",
                "required": false
            }
        ],
        "outputs": [
            {
                "name": "object output",
                "datatype": "http://www.w3.org/2001/XMLSchema#anySimpleType",
                "required": true
            }
        ]
    },
    {
        "name": "Function to parse integer from string input",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#similarityBasedValueMappingFunc",
        "description": "",
        "parameters": [
            {
                "name": "input",
                "datatype": "http://www.w3.org/2001/XMLSchema#anySimpleType",
                "required": true
            },
            {
                "name": "params map",
                "datatype": "http://www.w3.org/2001/XMLSchema#anySimpleType",
                "required": false
            }
        ],
        "outputs": [
            {
                "name": "object output",
                "datatype": "http://www.w3.org/2001/XMLSchema#anySimpleType",
                "required": true
            }
        ]
    },
    {
        "name": "Function to parse integer from string input",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#formatUrlFunc",
        "description": "",
        "parameters": [
            {
                "name": "input",
                "datatype": "http://www.w3.org/2001/XMLSchema#string",
                "required": true
            }
        ],
        "outputs": [
            {
                "name": "string output",
                "datatype": "http://www.w3.org/2001/XMLSchema#string",
                "required": true
            }
        ]
    },
    {
        "name": "Function to...",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#pickPropertiesToObjectFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        "outputs": [
            {
                "name": "object output",
                "datatype": "http://www.w3.org/2001/XMLSchema#anySimpleType",
                "required": true
            }
        ]
    },
    {
        "name": "testing",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#simpleCoordinateToComplexFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
                required: true
            }
        ],
        "outputs": [
            {
                name: "string output",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
                required: true
            }
        ]
    },
    {
        "name": "Function to...",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#configurableObjectToParamsFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        "name": "testing",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#configurableStringToObjectFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        "name": "Function ",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#pickFirstFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        "name": "Function to...",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#staticContentFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        name: "formatStringWithSubstitutor",
        uri: "http://uri.suomi.fi/datamodel/ns/mscr#formatStringWithSubstitutorFunc",
        description: "",
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        outputs: [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        name: "Function to...",
        uri: "http://uri.suomi.fi/datamodel/ns/mscr#simpleReplaceStringFunc",
        description: "",
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        outputs: [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        name: "Function to...",
        uri: "http://uri.suomi.fi/datamodel/ns/mscr#mapVocabulariesFunc",
        description: "",
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        outputs: [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        name: "Function ",
        uri: "http://uri.suomi.fi/datamodel/ns/mscr#concatenateObjectFunc",
        description: "",
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ],
        outputs: [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        name: "concatListsFunc",
        uri: "http://uri.suomi.fi/datamodel/ns/mscr#concatListsFunc",
        description: "",
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        outputs: [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        name: "Function to parse integer from string input",
        uri: "http://uri.suomi.fi/datamodel/ns/mscr#formatStringFunc",
        description: "",
        parameters: [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        "name": "testing",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#copyMapFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        "name": "testing",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#configurableObjectToStringFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        "outputs": [
            {
                name: "string output",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
                required: true
            }
        ]
    },
    {
        "name": "Function to...",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#formatDateFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        "outputs": [
            {
                name: "string output",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
                required: true
            }
        ]
    },
    {
        "name": "Function to parse double from string input",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#stringToDoubleFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ],
        "outputs": [
            {
                name: "double output",
                datatype: "http://www.w3.org/2001/XMLSchema#double",
                required: true
            }
        ]
    },
    {
        "name": "testing",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#anyToStringFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ],
        "outputs": [
            {
                name: "string output",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
                required: true
            }
        ]
    },
    {
        "name": "Function to...",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#pickPropertyWithJSONPathFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        "name": "testing",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#customCoordinateToStringFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        "name": "Function to parse integer from string input",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#prefixStringFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        "outputs": [
            {
                name: "string output",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
                required: true
            }
        ]
    },
    {
        "name": "Function to transform celsius (double) to fahrenheit (double)",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#celsiusToFahrenheitFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ],
        "outputs": [
            {
                name: "double output",
                datatype: "http://www.w3.org/2001/XMLSchema#double",
                required: true
            }
        ]
    },
    {
        "name": "Function to...",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#clarinToFullDateFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    },
    {
        "name": "Function to...",
        "uri": "http://uri.suomi.fi/datamodel/ns/mscr#dataciteCreatorToB2FindFunc",
        "description": "",
        "parameters": [
            {
                name: "input",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            },
            {
                name: "params map",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: false
            }
        ],
        "outputs": [
            {
                name: "object output",
                datatype: "http://www.w3.org/2001/XMLSchema#anySimpleType",
                required: true
            }
        ]
    }
];

export default function MockupSchemaLoader(emptyTemplate: boolean): Promise<RenderTree[] | undefined> {
    const hugeTestData: any = {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "properties": {
            "null": {
                "title": null,
                "description": null
            },
            "acoustic_area_backscattering_strength_in_sea_water": {
                "title": "acoustic_area_backscattering_strength_in_sea_water",
                "description": "Acoustic area backscattering strength is 10 times the log10 of the ratio of the area backscattering coefficient to the reference value, 1 (m2 m-2). Area backscattering coefficient is the integral of the volume backscattering coefficient over a defined distance. Volume backscattering coefficient is the linear form of acoustic_volume_backscattering_strength_in_sea_water. For further details see MacLennan et. al (2002) doi:10.1006/jmsc.2001.1158."
            },
            "acoustic_signal_roundtrip_travel_time_in_sea_water": {
                "title": "acoustic_signal_roundtrip_travel_time_in_sea_water",
                "description": "The quantity with standard name acoustic_signal_roundtrip_travel_time_in_sea_water is the time taken for an acoustic signal to propagate from the emitting instrument to a reflecting surface and back again to the instrument. In the case of an instrument based on the sea floor and measuring the roundtrip time to the sea surface, the data are commonly used as a measure of ocean heat content."
            },
            "acoustic_target_strength_in_sea_water": {
                "title": "acoustic_target_strength_in_sea_water",
                "description": "Target strength is 10 times the log10 of the ratio of backscattering cross-section to the reference value, 1 m2. Backscattering cross-section is a parameter computed from the intensity of the backscattered sound wave relative to the intensity of the incident sound wave. For further details see MacLennan et. al (2002) doi:10.1006/jmsc.2001.1158."
            },
            "acoustic_volume_backscattering_strength_in_sea_water": {
                "title": "acoustic_volume_backscattering_strength_in_sea_water",
                "description": "Acoustic volume backscattering strength is 10 times the log10 of the ratio of the volume backscattering coefficient to the reference value, 1 m-1. Volume backscattering coefficient is the integral of the backscattering cross-section divided by the volume sampled. Backscattering cross-section is a parameter computed from the intensity of the backscattered sound wave relative to the intensity of the incident sound wave. The parameter is computed to provide a measurement that is proportional to biomass density per unit volume in the field of fisheries acoustics. For further details see MacLennan et. al (2002) doi:10.1006/jmsc.2001.1158."
            },
        }
    }

    const testData: any = {
        '$schema': 'http://json-schema.org/draft-04/schema#',
        'type': 'object',
        'properties': {
            '$schema': {
                'type': 'string'
            },
            'string_type': {
                'type': 'string',
                'description': '01_string_description'
            },
            'number_type': {
                'type': 'number',
                'minimum': 3,
                'exclusiveMinimum': false
            },
            'integer_type': {
                'type': 'integer',
                'minimum': 2
            },
            'boolean_type': {
                'type': 'boolean'
            },
            'null_type': {
                'type': 'null'
            },
            'object_type': {
                'title': 'OBJECT TYPE',
                'type': 'object',
                'properties': {
                    'string_property': {
                        'title': 'string_prop',
                        'type': 'string'
                    }
                },
                'required': ['string_property']
            },
            'array_string_type': {
                'type': 'array',
                'maxItems': 5,
                'items': {
                    'type': 'string'
                }
            },
            'object_arrays_type': {
                'type': 'object',
                'properties': {
                    'array_property': {
                        'title': 'array_prop',
                        'type': 'array',
                        'items': {
                            'type': 'number'
                        }
                    }
                }
            }
        },
        'additionalProperties': false,
        'b2share': {
            'presentation': {
                'major': ['community', 'titles', 'descriptions', 'creators', 'open_access', 'embargo_date', 'license', 'disciplines', 'keywords', 'contact_email'],
                'minor': ['contributors', 'resource_types', 'alternate_identifiers', 'version', 'publisher', 'language']
            }
        }
    };

    const testSchema: any = {
        '$schema': 'http://json-schema.org/draft-04/schema#',
        'type': 'object',
        'properties': {
            '$schema': {
                'type': 'string'
            },
            'creators': {
                'title': 'Creators',
                'description': 'The full name of the creators. The personal name format should be: family, given (e.g.: Smith, John).',
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'creator_name': {
                            'type': 'string'
                        }
                    },
                    'additionalProperties': false,
                    'required': ['creator_name']
                },
                'uniqueItems': true
            },
            'titles': {
                'title': 'Titles',
                'description': 'The title(s) of the uploaded resource, or a name by which the resource is known.',
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'title': {
                            'type': 'string'
                        }
                    },
                    'additionalProperties': false,
                    'required': ['title']
                },
                'minItems': 1,
                'uniqueItems': true
            },
            'publisher': {
                'title': 'Publisher',
                'description': 'The entity responsible for making the resource available, either a person, an organization, or a service.',
                'type': 'string'
            },
            'publication_date': {
                'title': 'Publication Date',
                'description': 'The date when the data was or will be made publicly available (e.g. 1971-07-13)',
                'type': 'string',
                'format': 'date'
            },
            'disciplines': {
                'title': 'Disciplines',
                'description': 'The scientific disciplines linked with the resource.',
                'type': 'array',
                'items': {
                    'type': 'string'
                },
                'uniqueItems': true
            },
            'keywords': {
                'title': 'Keywords',
                'description': 'A list of keywords or key phrases describing the resource.',
                'type': 'array',
                'items': {
                    'type': 'string'
                },
                'uniqueItems': true
            },
            'contributors': {
                'title': 'Contributors',
                'description': 'The list of all other contributors. Please mention all persons that were relevant in the creation of the resource.',
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'contributor_name': {
                            'title': 'Name',
                            'type': 'string'
                        },
                        'contributor_type': {
                            'title': 'Type',
                            'enum': ['ContactPerson', 'DataCollector', 'DataCurator', 'DataManager', 'Distributor', 'Editor', 'HostingInstitution', 'Producer', 'ProjectLeader', 'ProjectManager', 'ProjectMember', 'RegistrationAgency', 'RegistrationAuthority', 'RelatedPerson', 'Researcher', 'ResearchGroup', 'RightsHolder', 'Sponsor', 'Supervisor', 'WorkPackageLeader', 'Other']
                        }
                    },
                    'additionalProperties': false,
                    'required': ['contributor_name', 'contributor_type']
                },
                'uniqueItems': true
            },
            'language': {
                'title': 'Language',
                'description': 'The primary language of the resource. Please use ISO_639-3 language codes.',
                'type': 'string'
            },
            'resource_types': {
                'title': 'Resource Type',
                'description': 'The type(s) of the resource.',
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'resource_type': {
                            'title': 'Description',
                            'type': 'string'
                        },
                        'resource_type_general': {
                            'title': 'Category',
                            'enum': ['Audiovisual', 'Collection', 'Dataset', 'Event', 'Image', 'InteractiveResource', 'Model', 'PhysicalObject', 'Service', 'Software', 'Sound', 'Text', 'Workflow', 'Other']
                        }
                    },
                    'additionalProperties': false,
                    'required': ['resource_type_general']
                },
                'minItems': 1,
                'uniqueItems': true
            },
            'alternate_identifiers': {
                'title': 'Alternate identifiers',
                'description': 'Any kind of other reference such as a URN, URI or an ISBN number.',
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'alternate_identifier': {
                            'type': 'string'
                        },
                        'alternate_identifier_type': {
                            'title': 'Type',
                            'type': 'string'
                        }
                    },
                    'additionalProperties': false,
                    'required': ['alternate_identifier', 'alternate_identifier_type']
                },
                'uniqueItems': true
            },
            'descriptions': {
                'title': 'Descriptions',
                'description': 'A more elaborate description of the resource. Focus on a content description that makes it easy for others to find, and to interpret its relevance.',
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'description': {
                            'type': 'string'
                        },
                        'description_type': {
                            'title': 'Type',
                            'enum': ['Abstract', 'Methods', 'SeriesInformation', 'TableOfContents', 'TechnicalInfo', 'Other']
                        }
                    },
                    'additionalProperties': false,
                    'required': ['description', 'description_type']
                },
                'uniqueItems': true
            },
            'version': {
                'title': 'Version',
                'description': 'Denote the version of the resource.',
                'type': 'string'
            },
            'contact_email': {
                'title': 'Contact Email',
                'description': 'Contact email information for this record.',
                'type': 'string',
                'format': 'email'
            },
            'open_access': {
                'title': 'Open Access',
                'description': 'Indicate whether the record\'s files are publicly accessible or not. In case of restricted access the uploaded files will only be accessible by the record\'s owner and the community administrators. Please note that the record\'s metadata is always publicly accessible. ',
                'type': 'boolean'
            },
            'embargo_date': {
                'title': 'Embargo Date',
                'description': 'The date marking the end of the embargo period. The record will be marked as open access on the specified date at midnight. Please note that the record metadata is always publicly accessible, and only the data files can have private access.',
                'type': 'string',
                'format': 'date-time'
            },
            'license': {
                'title': 'License',
                'description': 'Specify the license under which this data set is available to the users (e.g. GPL, Apache v2 or Commercial). Please use the License Selector for help and additional information.',
                'type': 'object',
                'properties': {
                    'license': {
                        'type': 'string'
                    },
                    'license_uri': {
                        'title': 'License URL',
                        'type': 'string',
                        'format': 'uri'
                    }
                },
                'additionalProperties': false,
                'required': ['license']
            },
            'community': {
                'title': 'Community',
                'description': 'The community to which the record has been submitted.',
                'type': 'string'
            },
            'community_specific': {
                'type': 'object'
            },
            'publication_state': {
                'title': 'Publication State',
                'description': 'State of the publication workflow.',
                'type': 'string',
                'enum': ['draft', 'submitted', 'published']
            },
            '_pid': {
                'title': 'Persistent Identifiers',
                'description': 'Array of persistent identifiers pointing to this record.'
            },
            '_deposit': {
                'type': 'object'
            },
            '_oai': {
                'type': 'object'
            },
            '_files': {
                'type': 'array'
            }
        },
        'required': ['community', 'titles', 'open_access', 'publication_state', 'community_specific'],
        'additionalProperties': false,
        'b2share': {
            'presentation': {
                'major': ['community', 'titles', 'descriptions', 'creators', 'open_access', 'embargo_date', 'license', 'disciplines', 'keywords', 'contact_email'],
                'minor': ['contributors', 'resource_types', 'alternate_identifiers', 'version', 'publisher', 'language']
            }
        }
    };

    let allTreeNodes: RenderTree[] = [];

    let currentTreeNode: RenderTree = {
        idNumeric: 0,
        id: '0',
        name: '',
        isLinked: false,
        title: '',
        type: '',
        description: '',
        required: '',
        isMappable: '',
        parentName: '',
        jsonPath: '$schema',
        parentId: 0,
        children: []
    };

    let nodeId = 0;

    function increaseNodeNumber() {
        nodeId += 1;
    }

    function createTreeObject(object: string, value: string, parent: string, rootId: any, jsonPath: string) {
        currentTreeNode.jsonPath = jsonPath + '.' + object;
        currentTreeNode.idNumeric = nodeId;
        currentTreeNode.id = nodeId.toString();
        currentTreeNode.parentId = rootId;
        currentTreeNode.name = object;
        currentTreeNode.title = value;
        currentTreeNode.parentName = parent;
        increaseNodeNumber();
    }

    function walkJson(json_object: any, parent: any, rootId: number, jsonPath: string) {
        for (const obj in json_object) {
            if (typeof json_object[obj] === 'string') {
                //console.log(`leaf ${obj} = ${json_object[obj]}`);

                // OBJECT IS A LEAF LEVEL OBJECT
                currentTreeNode = {
                    isLinked: false, idNumeric: 0, id: '0', name: '', title: '', type: 'string', description: '', required: '', parentId: 0, jsonPath, children: []};
                createTreeObject(obj, json_object[obj], parent, rootId, jsonPath);
                allTreeNodes.push(cloneDeep(currentTreeNode));
                }
            else if (typeof json_object[obj] === 'boolean') {
                //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! FOUND BOOLEAN', obj, json_object[obj], json_object);

                // OBJECT IS A LEAF LEVEL OBJECT
                currentTreeNode = {
                    isLinked: false, idNumeric: 0, id: '0', name: '', title: '', type: json_object[obj].toString(), description: '', required: '', parentId: 0, jsonPath, children: []};
                createTreeObject(obj, json_object[obj], parent, rootId, jsonPath);
                allTreeNodes.push(cloneDeep(currentTreeNode));
            }
                else {
                // OBJECT HAS CHILDREN
                currentTreeNode = {
                    isLinked: false, idNumeric: 0, id: '0', name: '', title: '', type: Array.isArray(json_object[obj]) ? 'array' : 'composite', description: '', required: '', parentId: 0, jsonPath, children: []};
                currentTreeNode.name = obj;
                currentTreeNode.parentName = parent;
                currentTreeNode.parentId = rootId;
                currentTreeNode.idNumeric = nodeId;
                currentTreeNode.id = nodeId.toString();


                currentTreeNode.jsonPath = jsonPath + '.' + obj;
                increaseNodeNumber();
                allTreeNodes.push(cloneDeep(currentTreeNode));
                walkJson(json_object[obj], obj, nodeId - 1, currentTreeNode.jsonPath);
            }
        }
        return allTreeNodes;
    }



    function mergeAttributesToParent(inputNodes: RenderTree[] | undefined) {
        if (inputNodes) {
            let outputNodes = inputNodes.map((parent: RenderTree) => {
                    if (parent.children) {
                        let i = parent.children.length;
                        while (i--) {
                         // @ts-ignore
                            if (parent.children[i] && parent.children[i].children.length > 0) {
                             mergeAttributesToParent([parent.children[i]]);
                         }
                         if (parent.children[i].name === 'type') {
                                parent.type = parent.children[i].title;
                                //parent.children.splice(i, 1);
                            } else if (parent.children[i].name === 'description') {
                                parent.description = parent.children[i].title;
                                //parent.children.splice(i, 1);
                            } else if (parent.children[i].name === 'title') {
                                parent.title = parent.children[i].title;
                                //parent.children.splice(i, 1);
                            }
                        }
                    }
                    return parent;
                }
            );
            return outputNodes;
        }
    }

    function processChildNodes() {
        for (let i = allTreeNodes.length - 1; i > 0; i -= 1) {
            if (allTreeNodes[i]) {
                allTreeNodes[allTreeNodes[i].parentId].children.push(cloneDeep(allTreeNodes[i]));
            }
        }
        return {allTreeNodes};
    }

    // Recursive tree creation causes tree to build in reversed order, so tree needs to be reversed to match the node order in original JSON
    function reverseTreeRootLevel(inputNodes: RenderTree[] | undefined) {
        let retNodes: RenderTree[];
        if (inputNodes){
            return inputNodes.reverse();
        }
    }

    // Unused
    function reverseTreeChildren(inputNodes: RenderTree[] | undefined) {
        if (inputNodes){
            for (let i = 0; i < inputNodes.length; i += 1) {
                // @ts-ignore
                if (inputNodes[i].children.length > 1) {
                    // @ts-ignore
                    inputNodes[i].children = inputNodes[i].children.reverse()
                    reverseTreeChildren(inputNodes[i].children);
                }
            }
            return inputNodes;
        }
    }

    walkJson(emptyTemplate ? testSchema : currentTreeNode, null, 0, 'ROOT');
    processChildNodes();
    console.log('######### NEW', mergeAttributesToParent(reverseTreeRootLevel(allTreeNodes)));

    return new Promise((resolve) => {
        resolve(reverseTreeRootLevel(allTreeNodes));
    });
}
export function getFilterFunctions(): Promise<any> {
    return new Promise((resolve) => {
        resolve(functionsMockup);
    });
}













