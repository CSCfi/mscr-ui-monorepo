import {
  CrosswalkConnectionNew,
  NodeMapping,
} from '@app/common/interfaces/crosswalk-connection.interface';
import validateMapping from '@app/modules/crosswalk-editor/mapping-validator';
import {Dropdown, IconPlus, Textarea, TextInput} from 'suomifi-ui-components';
import {DropdownItem} from 'suomifi-ui-components';
import {useEffect, useState} from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
} from 'suomifi-ui-components';
import NodeListingAccordion from "@app/modules/crosswalk-editor/tabs/node-mappings/node-listing-accordion";
import {MidColumnWrapper} from "@app/modules/crosswalk-editor/tabs/node-mappings/node-mappings.styles";
import {cloneDeep} from 'lodash';

export default function NodeMappings(props: {
  nodeSelections: CrosswalkConnectionNew[];
  performMappingsModalAction: any;
  mappingFilters: any;
  mappingFunctions: any;
  modalOpen: boolean;
  isPatchMappingOperation: boolean;
  isOneToManyMapping: boolean;
}) {
  const EXACT_MATCH_DROPDOWN_DEFAULT = 'http://www.w3.org/2004/02/skos/core#exactMatch';

  let sourceSelectionInit = '';
  let targetSelectionInit = '';

  const predicateValues = [
    {
      name: 'Broad match',
      id: 'http://www.w3.org/2004/02/skos/core#broadMatch',
    },
    {
      name: 'Broader',
      id: 'http://www.w3.org/2004/02/skos/core#broader',
    },
    {
      name: 'Broader transitive',
      id: 'http://www.w3.org/2004/02/skos/core#broaderTransitive',
    },
    {
      name: 'Close match',
      id: 'http://www.w3.org/2004/02/skos/core#closeMatch',
    },
    {
      name: 'Exact match',
      id: 'http://www.w3.org/2004/02/skos/core#exactMatch',
    },
    {
      name: 'Narrow match',
      id: 'http://www.w3.org/2004/02/skos/core#narrowMatch',
    },
    {
      name: 'Narrower',
      id: 'http://www.w3.org/2004/02/skos/core#narrower',
    },
    {
      name: 'Narrower transitive',
      id: 'http://www.w3.org/2004/02/skos/core#narrowerTransitive',
    },
    {
      name: 'Related',
      id: 'http://www.w3.org/2004/02/skos/core#related',
    },
    {
      name: 'Related match',
      id: 'http://www.w3.org/2004/02/skos/core#relatedMatch',
    },
  ];

  const filterTargetSelectInit = '';
  const filterOperationsSelectInit = '';

  useEffect(() => {
    for (let i = 0; i < props.nodeSelections.length; i += 1) {
      if (props?.nodeSelections[i]?.source) {
        sourceSelectionInit = props.nodeSelections[i].source.id;
      }
      if (props?.nodeSelections[i]?.target) {
        targetSelectionInit = props.nodeSelections[i].target.id;
      }
    }
    if (props?.nodeSelections[0]?.notes) {
      setNotesValue(props.nodeSelections[0].notes);
    }
    if (props?.nodeSelections[0]?.predicate) {
      setPredicateValue(props.nodeSelections[0].predicate);
    }
    if (props?.nodeSelections[0]?.processing) {
      setMappingOperationSelection(props.nodeSelections[0].processing.id);
      setMappingOperationFormatted(props.nodeSelections[0].processing);
    }

    if (!props?.isPatchMappingOperation) {
      setPredicateValue(EXACT_MATCH_DROPDOWN_DEFAULT);
    }
    if (props?.mappingFunctions) {
      const emptyDefaultValue = {name: '', uri: 'N/A'}
      setMappingFunctions([emptyDefaultValue, ...props.mappingFunctions]);
    }

    setVisible(props?.modalOpen);
    setMappingNodes(props?.nodeSelections);
  }, [props]);

  const [targetOperationValue, setTargetOperationValue] = useState('');
  const [mappingOperationSelection, setMappingOperationSelection] = useState<string | undefined>(undefined);
  const [mappingOperationFormatted, setMappingOperationFormatted] = useState([] as any);
  const [mappingFunctions, setMappingFunctions] = useState([] as any);
  const [predicateValue, setPredicateValue] = useState<string>(
    EXACT_MATCH_DROPDOWN_DEFAULT,
  );

  const [filterTarget, setFilterTarget] = useState(filterTargetSelectInit);
  const [filterOperation, setFilterOperation] = useState(
    filterOperationsSelectInit,
  );

  const [visible, setVisible] = useState(props.modalOpen);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [mappingNodes, setMappingNodes] = useState<CrosswalkConnectionNew[] | undefined>(undefined);

  const [notesValue, setNotesValue] = useState<string>('');
  const mappingPayloadInit: NodeMapping = {
    predicate: '',
    source: [],
    target: [],
  };

  function generateSaveMappingPayload() {
    let mappings = mappingPayloadInit;
    if (mappingNodes) {
      mappings.source.push({
        id: mappingNodes[0].source.id,
        label: mappingNodes[0].source.name,
        uri: mappingNodes[0].source.uri,
        processing: mappingNodes[0].sourceProcessing ? mappingNodes[0].sourceProcessing : undefined
      });
      mappings.target.push({
          id: mappingNodes[0].target.id,
          label: mappingNodes[0].target.name,
          uri: mappingNodes[0].target.uri
        }
      );

      if (props.isOneToManyMapping) {
        // Merge targets into single  source for one to many mapping
        for (let i = 0; i < props.nodeSelections.length; i += 1) {
          if (i < mappingNodes.length - 1 && (mappingNodes[i].source.id === mappingNodes[i + 1].source.id)) {
            mappings.target.push({
              id: mappingNodes[i + 1].target.id,
              label: mappingNodes[i + 1].target.name,
              uri: mappingNodes[i + 1].target.uri,
              processing: mappingNodes[i + 1].sourceProcessing ? mappingNodes[i + 1].sourceProcessing : undefined
            });
          }
        }
      } else {
        // Merge sources into single target for many to one mapping
        for (let i = 0; i < props.nodeSelections.length; i += 1) {
          if (i < mappingNodes.length - 1 && (mappingNodes[i].target.id === mappingNodes[i + 1].target.id)) {
            mappings.source.push({
              id: mappingNodes[i + 1].source.id,
              label: mappingNodes[i + 1].source.name,
              uri: mappingNodes[i + 1].source.uri,
              processing: mappingNodes[i + 1].sourceProcessing ? mappingNodes[i + 1].sourceProcessing : undefined
            });
          }
        }
      }
    }

    mappings.predicate = predicateValue ? predicateValue : '0';
    mappings.notes = notesValue;

    if (mappingOperationSelection) {
      mappings.processing = mappingOperationFormatted;
    }
    return mappings;
  }

  function closeModal() {
    setNotesValue('');
    props.performMappingsModalAction('closeModal', null, null);
  }

  function generatePropertiesDropdownItems(input: any) {
    let keys = [];
    for (let key in input) {
      keys.push({name: key});
    }
    return keys;
  }

  function save() {
    if (props.isPatchMappingOperation) {
      props.performMappingsModalAction(
        'save',
        generateSaveMappingPayload(),
        props.nodeSelections[0].id,
      );
    } else {
      props.performMappingsModalAction('addMapping', generateSaveMappingPayload());
    }
    setNotesValue('');
  }

// CLEAR FIELDS WHEN MODAL OPENED
  useEffect(() => {
    setTargetOperationValue('');
    setMappingOperationSelection(undefined);
    setFilterTarget(filterTargetSelectInit);
    setFilterOperation(filterOperationsSelectInit);
  }, [visible]);

// VALIDATE MAPPING
  useEffect(() => {
    if (mappingNodes) {
      generatePropertiesDropdownItems(mappingNodes[0].source.properties);
      validateMappings(mappingNodes);
      //setValidationErrors(validateMapping(mappingNodes[0]));
    }
  }, [
    mappingNodes,
    targetOperationValue,
    filterTarget,
    filterOperation,
    predicateValue,
  ]);

  function validateMappings(mappingNodes: CrosswalkConnectionNew[]){
    console.log('VALIDATE', mappingNodes);
    let mappingErrors: string[] = [];
    mappingNodes.forEach(node => {
      if (node.sourceProcessing) {
        // Source has source processing function
        const sourceProcessingIOFormats = getMappingFunctionIOFormats(node.sourceProcessing.id);
        if (node.source.properties.type !== sourceProcessingIOFormats.input) {
          mappingErrors.push('Datatype mismatch: ' + node.source.name + ': ' + node.source.properties.type + ' -> ' + node.sourceProcessing.id + ': ' + sourceProcessingIOFormats.input);
        }
        if (node?.processing) {
          // Mapping operation is present
          const mappingFncIOFormats = getMappingFunctionIOFormats(node.processing.id);
          if (sourceProcessingIOFormats.output !== mappingFncIOFormats.input) {
            mappingErrors.push('Datatype mismatch: ' + node.sourceProcessing.id + ': ' + sourceProcessingIOFormats.output + ' -> ' + node.processing.id + ': ' + mappingFncIOFormats.input);
          }
          if (node.target.properties.type !== mappingFncIOFormats.output) {
            mappingErrors.push('Datatype mismatch: ' + node.processing.id + ': ' + mappingFncIOFormats.output + ' -> ' + node.target.name + ': ' + node.target.properties.type);
          }
        } else {
          // Source has source processing and no mapping operation
          if (sourceProcessingIOFormats.output !== node.target.properties.type) {
            mappingErrors.push('Datatype mismatch: ' + node.sourceProcessing.id + ': ' + sourceProcessingIOFormats.output + ' -> ' + node.target.id + ': ' + node.target.properties.type);
          }
        }

      } else {
        // Source has no source processing function
        if (node?.processing) {
          // Mapping operation is present
          const mappingFncIOFormats = getMappingFunctionIOFormats(node?.processing?.id);
          if (node.source.properties.type !== mappingFncIOFormats.input) {
            mappingErrors.push('Datatype mismatch: ' + node.source.name + ': ' + node.source.properties.type + ' -> ' + node.processing.id + ': ' + mappingFncIOFormats.input);
          }
          if (node.target.properties.type !== mappingFncIOFormats.output) {
            mappingErrors.push('Datatype mismatch: ' + node.processing.id + ': ' + mappingFncIOFormats.output + ' -> ' + node.target.name + ': ' + node.target.properties.type);
          }
        } else {
          // Source has no source processing function and no mapping operation
          if (node.source.properties.type !== node.target.properties.type ) {
            mappingErrors.push('Datatype mismatch: ' + node.source.name + ': ' + node.source.properties.type + ' -> ' + node.target.name + ': ' + node.target.properties.type);
          }
        }
      }
      mappingErrors.forEach(error => console.log(error));
    });
  }

  function getMappingFunctionIOFormats(functionId: string) {
    let IOFormats = {input: '', output: ''}
    
    const functions = props.mappingFunctions.filter((item: any) => item.uri === functionId);
    functions[0].parameters.map((param: { name: string; datatype: any; }) => {
      if (param?.name === 'input' && param?.datatype){
        IOFormats.input = param.datatype;
      }
    });
    if (functions[0]?.outputs){
      functions[0]?.outputs[0]?.datatype ? IOFormats.output = functions[0]?.outputs[0]?.datatype : undefined;
    }
    return IOFormats;
  }

  function accordionCallbackFunction(action: string, mappingId: any, operationValue: any, operationName: any, mappingOperationKey: any) {
    if (mappingNodes) {
      if (action === 'moveNodeUp' && mappingNodes.length > 1) {
        let sourceNodesNew = [...mappingNodes];
        for (let i = 0; i < mappingNodes.length; i += 1) {
          if (mappingNodes[i].source.id === mappingId) {
            let first = mappingNodes[i - 1];
            let second = mappingNodes[i];
            sourceNodesNew[i - 1] = second;
            sourceNodesNew[i] = first;
            setMappingNodes(sourceNodesNew);
          }
        }
      } else if (action === 'moveNodeDown' && mappingNodes.length > 1) {
        let sourceNodesNew = [...mappingNodes];
        for (let i = 0; i < mappingNodes.length; i += 1) {
          if (mappingNodes[i].source.id === mappingId) {
            let first = mappingNodes[i];
            let second = mappingNodes[i + 1];
            sourceNodesNew[i] = second;
            sourceNodesNew[i + 1] = first;
            setMappingNodes(sourceNodesNew);
          }
        }
      } else if (action === 'deleteSourceNode' && mappingNodes.length > 1) {
        let newNodeSelections = mappingNodes.filter(node => {
          return node.source.id !== mappingId;
        });
        setMappingNodes(newNodeSelections);
      } else if (action === 'deleteTargetNode' && mappingNodes.length > 1) {
        let newNodeSelections = mappingNodes.filter(node => {
          return node.target.id !== mappingId;
        });
        setMappingNodes(newNodeSelections);
      } else {
        let mappingNodesCopy = cloneDeep(mappingNodes);

        let newNodeSelections = mappingNodesCopy.map(node => {
          if (node.source.id === mappingId) {
            if (action === 'setMappingParameterDefaults') {
              node.sourceProcessing = mappingOperationKey;
            }
            if (action === 'updateSourceOperation') {
              const originalParams = getMappingFunctionParams(operationName);
              let formattedParams: any = {};
              if (originalParams) {
                originalParams.forEach((param: { name: any; defaultValue: any; }) => {
                  formattedParams[param.name] = param.defaultValue ? param.defaultValue : '';
                });
              }

              let processing: any = {
                id: operationName,
                params: formattedParams,
              };
              operationName !== 'N/A' ? node.sourceProcessing = processing : node.sourceProcessing = undefined;
            }

            if (action === 'updateSourceOperationValue') {
              if (node.sourceProcessing) {
                // @ts-ignore
                node.sourceProcessing.params[operationName] = operationValue;
              } else {
                const originalParams = getMappingFunctionParams(operationName);
                let formattedParams: any = {};
                if (originalParams) {
                  originalParams.forEach((param: { name: any; defaultValue: any; }) => {
                    formattedParams[param.name] = param.defaultValue ? param.defaultValue : '';
                  });
                }
                formattedParams[operationName] = operationValue;
                let processing: any = {
                  id: mappingOperationKey,
                  params: formattedParams,
                };
                operationName !== 'N/A' ? node.sourceProcessing = processing : node.sourceProcessing = undefined;
              }
            }
          }
          return node
        });
        setMappingNodes(newNodeSelections);
      }
    }
  }

  // Used by source nodes
  function getMappingFunctionParams(operationKey: string) {
    const functions = props.mappingFunctions.filter((item: any) => item.uri === operationKey
    ).map((fnc: { parameters: any; }) => {
      return fnc?.parameters;
    });
    return functions[0];
  }

  function generateMappingFunctionDefaultParams(operationKey: string) {
    const originalParams = props?.mappingFunctions.filter((fnc: { uri: string | undefined; }) => {
      return fnc.uri === operationKey;
    })[0].parameters;
    let formattedParams: any = {};
    if (originalParams) {
      originalParams.map((param: { name: any; defaultValue: any; }) => {
        formattedParams[param.name] = param?.defaultValue ? param?.defaultValue : '';
      });
    }
    return formattedParams;
  }

  function updateMappingOperationSelection(operationKey: string) {
    setMappingOperationSelection(operationKey);
    if (operationKey && operationKey.length > 0 && operationKey !== 'N/A') {
      const processing: any = {
        id: operationKey,
        params: generateMappingFunctionDefaultParams(operationKey),
      };
      setMappingOperationFormatted(processing);
    }
    else {
      setMappingOperationFormatted(undefined);
    }
  }

  function updateMappingOperationValue(operationKey: string, parameter: string, newValue: string) {
    setMappingOperationSelection(operationKey);
    let formattedParams = generateMappingFunctionDefaultParams(operationKey);
    formattedParams[parameter] = newValue;
    let processing: any = {
      id: operationKey,
      params: formattedParams,
    };
    setMappingOperationFormatted(processing);
  }

  function getMappingOperationValue(operationKey: string, parameterName: string) {
    if (props?.nodeSelections[0]?.processing) {
      return props?.nodeSelections[0]?.processing.params[parameterName];
    }
    else return '';
  }

  function generateMappingOperationFields(operationKey: string | undefined) {
    let ret: JSX.Element[] = [];
    if (operationKey && operationKey.length > 0 && operationKey !== 'N/A') {
      const mappingFunctionWithParams = props?.mappingFunctions.filter((fnc: { uri: string | undefined; }) => {
        return fnc.uri === operationKey;
      });

      mappingFunctionWithParams[0].parameters.forEach(parameter => {
        if (operationKey && operationKey !== 'N/A') {
          if (!parameter.defaultValue) {
            ret.push(<div className='mt-2'><TextInput
              labelText={parameter.name}
              defaultValue={getMappingOperationValue(operationKey, parameter.name)}
              onChange={(newValue) => updateMappingOperationValue(operationKey, parameter.name,newValue ? newValue.toString() : '')}
              visualPlaceholder="Operation value"
            /></div>);
          }
        }
      });
      return ret;
    } else return '';
  }

  return (
    <>
      <Modal
        appElementId="__next"
        visible={visible}
        onEscKeyDown={() => closeModal()}
        className="row bg-white edit-mapping-modal"
      >
        <ModalContent className="edit-mapping-modal-content">
          <ModalTitle>{props.isPatchMappingOperation ? 'Edit mapping' : 'Add mapping'}</ModalTitle>
          <div className="col flex-column d-flex justify-content-between">
            <div className="row bg-white">
              {/* SOURCE OPERATIONS */}
              <div className="col-4">
                <NodeListingAccordion nodes={mappingNodes} mappingFunctions={props.mappingFunctions}
                                      predicateOperationValues={predicateValues}
                                      accordionCallbackFunction={accordionCallbackFunction}
                                      isSourceAccordion={true}
                                      isOneToManyMapping={props.isOneToManyMapping}>
                </NodeListingAccordion>
              </div>

              {/* MID COLUMN */}
              <div className="col-4 d-flex flex-column bg-light-blue">
                <MidColumnWrapper>
                  <div><Dropdown className='mt-2 node-info-dropdown'
                                 labelText="Mapping operation"
                                 visualPlaceholder="Operation not selected"
                                 value={mappingOperationSelection ? mappingOperationSelection : props.nodeSelections[0]?.processing?.id}
                                 onChange={(newValue) => updateMappingOperationSelection(newValue)}
                  >
                    {mappingFunctions?.map((rt) => (
                      <DropdownItem key={rt.uri} value={rt.uri}>
                        {rt.name}
                      </DropdownItem>
                    ))}
                  </Dropdown></div>
                  {generateMappingOperationFields(mappingOperationSelection ? mappingOperationSelection : props.nodeSelections[0]?.processing?.id)}

                  <div>
                    <br/>
                    <Dropdown
                      className="mt-2 mb-4 node-info-dropdown"
                      labelText="Predicate"
                      visualPlaceholder="Exact match"
                      value={predicateValue}
                      //defaultValue={mappingNodes ? mappingNodes[0].predicate : ''}
                      onChange={(newValue) => {
                        setPredicateValue(newValue)
                      }
                      }
                    >
                      {predicateValues.map((rt) => (
                        <DropdownItem key={rt.id} value={rt.id}>
                          {rt.name}
                        </DropdownItem>
                      ))}
                    </Dropdown>

                  </div>
                  <Textarea
                    onChange={(event) => setNotesValue(event.target.value)}
                    labelText="Notes"
                    visualPlaceholder="No notes set. Add free form notes here."
                    value={notesValue}
                  />
                  <br/>
                </MidColumnWrapper>
              </div>

              {/* TARGET OPERATIONS */}
              <div className="col-4">
                <NodeListingAccordion nodes={mappingNodes} mappingFunctions={props.mappingFunctions}
                                      predicateOperationValues={predicateValues}
                                      accordionCallbackFunction={accordionCallbackFunction}
                                      isSourceAccordion={false}
                                      isOneToManyMapping={props.isOneToManyMapping}
                ></NodeListingAccordion>
              </div>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button style={{height: 'min-content'}} onClick={() => save()}>
            {'Save'}
          </Button>
          <Button
            style={{height: 'min-content'}}
            variant="secondary"
            onClick={() => closeModal()}
          >
            {'Cancel'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
