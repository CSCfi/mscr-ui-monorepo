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

export default function NodeMappings(props: {
  nodeSelections: CrosswalkConnectionNew[];
  performMappingsModalAction: any;
  mappingFilters: any;
  mappingFunctions: any;
  modalOpen: boolean;
  isJointPatchOperation: boolean;
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
        setSourceInputValue(props.nodeSelections[i].source.id);
      }
      if (props?.nodeSelections[i]?.target) {
        targetSelectionInit = props.nodeSelections[i].target.id;
        setTargetInputValue(props.nodeSelections[i].target.id);
      }
    }
    if (props?.nodeSelections[0]?.notes) {
      setNotesValue(props.nodeSelections[0].notes);
    }
    if (props?.nodeSelections[0]?.predicate) {
      setPredicateValue(props.nodeSelections[0].predicate);
    }
    if (props?.nodeSelections[0]?.processing) {
      setMappingOperationValue(props.nodeSelections[0].processing.id);
    }

    if (!props?.isJointPatchOperation) {
      setPredicateValue(EXACT_MATCH_DROPDOWN_DEFAULT);
    }
    if (props?.mappingFunctions) {
      const emptyDefaultValue = {name: '', uri: 'N/A'}
      setMappingFunctions([emptyDefaultValue, ...props.mappingFunctions]);
    }

    setVisible(props?.modalOpen);
    setSourceNodes(props?.nodeSelections);
  }, [props]);

  function selectSourceNode(nodeId: string) {
    for (let i = 0; i < props.nodeSelections.length; i += 1) {
      if (props?.nodeSelections[i]?.source.id === nodeId) {
        sourceSelectionInit = props.nodeSelections[i].source.id;
        setSourceInputValue(props.nodeSelections[i].source.id);
      }
    }
  }

  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(0);
  const [sourceInputValue, setSourceInputValue] = useState(sourceSelectionInit);
  const [sourceOperationValues, setSourceOperationValues] = useState([] as any);
  const [targetOperationValue, setTargetOperationValue] = useState('');
  const [mappingOperationValue, setMappingOperationValue] = useState('');
  const [mappingFunctions, setMappingFunctions] = useState([] as any);
  const [predicateValue, setPredicateValue] = useState<string>(
    EXACT_MATCH_DROPDOWN_DEFAULT,
  );

  const [filterTarget, setFilterTarget] = useState(filterTargetSelectInit);
  const [filterOperation, setFilterOperation] = useState(
    filterOperationsSelectInit,
  );
  const [filterOperationValue, setFilterOperationValue] = useState<string | undefined>('');

  const [targetInputValue, setTargetInputValue] = useState('');

  const [visible, setVisible] = useState(props.modalOpen);
  const [filterDetailsVisible, setFilterDetailsVisible] =
    useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [sourceNodes, setSourceNodes] = useState<CrosswalkConnectionNew[] | undefined>(undefined);
  const [selectedSourceNode, setSelectedSourceNode] = useState<CrosswalkConnectionNew | undefined>(undefined);

  const [notesValue, setNotesValue] = useState<string>('');
  const mappingPayloadInit: NodeMapping = {
    predicate: '',
    source: [],
    target: [],
  };

  function generateMappingPayload() {
    let mappings = mappingPayloadInit;
    if (sourceNodes) {
      console.log('GENERATING PAYLOAD', sourceNodes);
      mappings.source.push({
        id: sourceNodes[0].source.id,
        label: sourceNodes[0].source.name,
        uri: sourceNodes[0].source.uri,
        processing: sourceNodes[0].sourceProcessing ? props.nodeSelections[0].sourceProcessing : undefined
      });
      mappings.target.push({
          id: sourceNodes[0].target.id,
          label: sourceNodes[0].target.name,
          uri: sourceNodes[0].target.uri

        }
      );

      // Merge sources into single target (need to be implemented in opposite way if one to many mapping)
      for (let i = 0; i < props.nodeSelections.length; i += 1) {
        if (i < sourceNodes.length - 1 && (sourceNodes[i].target.id === sourceNodes[i + 1].target.id)) {
          mappings.source.push({
            id: sourceNodes[i + 1].source.id,
            label: sourceNodes[i + 1].source.name,
            uri: sourceNodes[i + 1].source.uri,
            processing: sourceNodes[i + 1].sourceProcessing ? sourceNodes[i + 1].sourceProcessing : undefined
          });
        }
      }

      //TODO: replace additonalProps with real params, fix dropdowns
      //const params =  {[getMappingFunctionParams(mappingOperationValue)[0].name]: operationSourceValue};

      mappings.predicate = predicateValue ? predicateValue : '0';
      mappings.notes = notesValue;

      if (mappingOperationValue) {
        mappings.processing = {
          id: mappingOperationValue,
          params: {additionalProp1: {}, additionalProp3: {}, additionalProp2: {}}
        }
      }
      return mappings;
    }
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

  function generateMappingOperationTextboxes(input: string) {
    let mappingInputFields: any[] = [];
    let ret = [];
    let ret2 = [];
    props.mappingFunctions
      .filter((item: { uri: string; }) => {
        return item.uri === input;
      })
      .map((match: any) => {
        mappingInputFields.push(match);
      });
    if (mappingInputFields.length > 0) {
      ret = mappingInputFields[0]['parameters'].map((item: { name: any; datatype: any; }) => {
        return {name: item.name, datatype: item.datatype};
      });
    }
    ret.forEach(() => {
      ret2.push(
        <TextInput
          onChange={(value) => null}
          visualPlaceholder="Operation value"
        />,
      );
    });
  }

  function save() {
    if (props.isJointPatchOperation) {
      props.performMappingsModalAction(
        'save',
        generateMappingPayload(),
        props.nodeSelections[0].id,
      );
    } else {
      props.performMappingsModalAction('addJoint', generateMappingPayload());
    }
    setNotesValue('');
  }

  // CLEAR FIELDS WHEN MODAL OPENED
  useEffect(() => {
    setSourceInputValue(sourceSelectionInit);
    setTargetOperationValue('');
    setMappingOperationValue('');
    setFilterTarget(filterTargetSelectInit);
    setFilterOperation(filterOperationsSelectInit);
  }, [visible]);

  // VALIDATE MAPPING
  useEffect(() => {
    if (sourceNodes) {
      generatePropertiesDropdownItems(sourceNodes[0].source.properties);
      setValidationErrors(validateMapping(sourceNodes[0]));
    }
    generateMappingOperationTextboxes(mappingOperationValue);
  }, [
    sourceNodes,
    sourceOperationValues,
    targetOperationValue,
    mappingOperationValue,
    filterTarget,
    filterOperation,
    predicateValue,
    mappingOperationValue,
  ]);

  function updateSourceOperationValue(value: string) {
    const newValues = [...sourceOperationValues];
    newValues[selectedSourceIndex] = value
    setSourceOperationValues(newValues);
  }

  function accordionCallbackFunction(operationName: string, dataId: any, operationValue: any, operationSourceValue: any) {
    if (sourceNodes) {
      if (operationName === 'moveNodeUp' && sourceNodes.length > 1) {
        let sourceNodesNew = [...sourceNodes];
      for (let i = 0; i < sourceNodes.length; i += 1){
        if (sourceNodes[i].source.id === dataId){
          let first = sourceNodes[i-1];
          let second = sourceNodes[i];
          sourceNodesNew[i-1] = second;
          sourceNodesNew[i] = first;
          setSourceNodes(sourceNodesNew);
          break;
        }
        }
      }

      else if (operationName === 'moveNodeDown' && sourceNodes.length > 1) {
        let sourceNodesNew = [...sourceNodes];
        for (let i = 0; i < sourceNodes.length; i += 1) {
          if (sourceNodes[i].source.id === dataId){
            let first = sourceNodes[i];
            let second = sourceNodes[i+1];
            sourceNodesNew[i] = second;
            sourceNodesNew[i+1] = first;
            setSourceNodes(sourceNodesNew);
            break;
          }
        }
      }

      else if (operationName === 'deleteSourceNode' && sourceNodes.length > 1) {
        let newNodeSelections = sourceNodes.filter(node => {
          return node.source.id !== dataId;
        });
        setSourceNodes(newNodeSelections);
      }

      else if (operationName === 'updateSourceOperation' || operationName === 'updateSourceOperationValue') {
        let newNodeSelections = sourceNodes.map(node => {
          if (node.source.id === dataId) {
            const params =  {[getMappingFunctionParams(operationValue)[0].name]: operationSourceValue};
            if (operationName === 'updateSourceOperation') {
              let processing: any = {
                id: operationValue,
                  params: params,
              };
              node.sourceProcessing = processing;
            }
          }
          return node
        });
        setSourceNodes(newNodeSelections);
      }
    }
  }

  function getMappingFunctionParams(functionId: string){
    const functions = props.mappingFunctions.filter((item: any) => item.uri === functionId
    ).map((fnc: { parameters: any; }) => {
      return fnc.parameters;
    });
    return functions[0];
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
          <ModalTitle>{props.isJointPatchOperation ? 'Edit mapping' : 'Add mapping'}</ModalTitle>
          <div className="col flex-column d-flex justify-content-between">
            <div className="row bg-white">
              {/* SOURCE OPERATIONS */}
              <div className="col-4">
                <NodeListingAccordion nodes={sourceNodes} mappingFunctions={props.mappingFunctions}
                                      predicateOperationValues={predicateValues}
                                      accordionCallbackFunction={accordionCallbackFunction} isSourceAccordion={true}></NodeListingAccordion>
                {/*                                <span hidden={filterDetailsVisible}>
                                <Button
                                  icon={<IconPlus />}
                                  style={{height: 'min-content'}}
                                  onClick={() => setFilterDetailsVisible(true)}
                                  variant="secondaryNoBorder"
                                >
                                    {'Add filter'}
                                </Button>
                                </span>

                                <div hidden={!filterDetailsVisible}>
                                    <Dropdown className='mt-2 node-info-dropdown'
                                              labelText="Source filter"
                                              visualPlaceholder="Filter target not selected"
                                              value={filterTarget}
                                              onChange={(newValue) => setFilterTarget(newValue)}
                                    >
                                        {generatePropertiesDropdownItems(props.selectedCrosswalk.source.properties).map((rt) => (
                                          <DropdownItem key={rt.id} value={rt.name}>
                                              {rt.name}
                                          </DropdownItem>
                                        ))}
                                    </Dropdown>
                                    <div>
                                        <Dropdown className='mt-2 node-info-dropdown'
                                                  visualPlaceholder="Filter function not selected"
                                                  value={filterOperation}
                                                  onChange={(newValue) => setFilterOperation(newValue)}
                                        >
                                            {props.mappingFilters.map((rt) => (
                                              <DropdownItem key={rt.id} value={rt.name}>
                                                  {rt.name}
                                              </DropdownItem>
                                            ))}
                                        </Dropdown>
                                    </div>
                                    <TextInput
                                      onChange={(value) => setSourceFilterValue('uri', value)}
                                      visualPlaceholder="Value"
                                    />
                                </div>
                                <br/>
                                <div><Dropdown className='mt-2 node-info-dropdown'
                                               labelText="Source operation"
                                               visualPlaceholder="Operation not selected"
                                               value={sourceOperationValue}
                                               onChange={(newValue) => setSourceOperationValue(newValue)}
                                >
                                    {props?.mappingFunctions.map((rt) => (
                                      <DropdownItem key={rt.uri} value={rt.name}>
                                          {rt.name}
                                      </DropdownItem>
                                    ))}
                                </Dropdown></div>*/}
              </div>

              {/* MID COLUMN */}
              <div className="col-4 d-flex flex-column bg-light-blue">
                <MidColumnWrapper>
                  <div><Dropdown className='mt-2 node-info-dropdown'
                                 labelText="Mapping operation"
                                 visualPlaceholder="Operation not selected"
                                 value={mappingOperationValue}
                                 onChange={(newValue) => setMappingOperationValue(newValue)}
                  >
                    {mappingFunctions?.map((rt) => (
                      <DropdownItem key={rt.uri} value={rt.uri}>
                        {rt.name}
                      </DropdownItem>
                    ))}
                  </Dropdown></div>
                  <div><TextInput
                    onChange={(value) => setFilterOperationValue(value ? value.toString() : '')}
                    visualPlaceholder="Operation value"
                  /></div>
                  <div>
                    <br/>
                    <Dropdown
                      className="mt-2 mb-4 node-info-dropdown"
                      labelText="Predicate"
                      visualPlaceholder="Exact match"
                      value={predicateValue}
                      defaultValue={sourceNodes ? sourceNodes[0].predicate : ''}
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
                    labelText="Notes:"
                    visualPlaceholder="No notes set. Add free form notes here."
                    value={notesValue}
                  />
                  <br/>
                </MidColumnWrapper>
              </div>

              {/* TARGET OPERATIONS */}
                <div className="col-4">
                  <NodeListingAccordion nodes={sourceNodes} mappingFunctions={props.mappingFunctions}
                                        predicateOperationValues={predicateValues}
                                        accordionCallbackFunction={accordionCallbackFunction} isSourceAccordion={false}></NodeListingAccordion>
                  {/*                                <span hidden={filterDetailsVisible}>
                                <Button
                                  icon={<IconPlus />}
                                  style={{height: 'min-content'}}
                                  onClick={() => setFilterDetailsVisible(true)}
                                  variant="secondaryNoBorder"
                                >
                                    {'Add filter'}
                                </Button>
                                </span>

                                <div hidden={!filterDetailsVisible}>
                                    <Dropdown className='mt-2 node-info-dropdown'
                                              labelText="Source filter"
                                              visualPlaceholder="Filter target not selected"
                                              value={filterTarget}
                                              onChange={(newValue) => setFilterTarget(newValue)}
                                    >
                                        {generatePropertiesDropdownItems(props.selectedCrosswalk.source.properties).map((rt) => (
                                          <DropdownItem key={rt.id} value={rt.name}>
                                              {rt.name}
                                          </DropdownItem>
                                        ))}
                                    </Dropdown>
                                    <div>
                                        <Dropdown className='mt-2 node-info-dropdown'
                                                  visualPlaceholder="Filter function not selected"
                                                  value={filterOperation}
                                                  onChange={(newValue) => setFilterOperation(newValue)}
                                        >
                                            {props.mappingFilters.map((rt) => (
                                              <DropdownItem key={rt.id} value={rt.name}>
                                                  {rt.name}
                                              </DropdownItem>
                                            ))}
                                        </Dropdown>
                                    </div>
                                    <TextInput
                                      onChange={(value) => setSourceFilterValue('uri', value)}
                                      visualPlaceholder="Value"
                                    />
                                </div>
                                <br/>
                                <div><Dropdown className='mt-2 node-info-dropdown'
                                               labelText="Source operation"
                                               visualPlaceholder="Operation not selected"
                                               value={sourceOperationValue}
                                               onChange={(newValue) => setSourceOperationValue(newValue)}
                                >
                                    {props?.mappingFunctions.map((rt) => (
                                      <DropdownItem key={rt.uri} value={rt.name}>
                                          {rt.name}
                                      </DropdownItem>
                                    ))}
                                </Dropdown></div>*/}
                </div>



{/*                <div className="col-4 bg-light-blue">
                <div className="ps-2">
                  <p>
                    <span className="fw-bold">Target: </span>
                    {sourceNodes ? sourceNodes[0].target.name : ''}
                  </p>
                  <p>
                    <span className="fw-bold">Type: </span>
                    {sourceNodes ? sourceNodes[0].target.properties.type : ''}
                  </p>
                  <p className="mb-1">
                    <span className="fw-bold">Description: </span>
                    {sourceNodes ? (sourceNodes[0].target.properties.description
                      ? sourceNodes[0].target.properties.description
                      : 'N/A') : ''}
                  </p>
                  <br/>
                                                  <div><Dropdown className='mt-2 node-info-dropdown'
                                               labelText="Target operation"
                                               visualPlaceholder="Operation not selected"
                                               value={targetOperationValue}
                                               onChange={(newValue) => setTargetOperationValue(newValue)}
                                >
                                    {props?.mappingFunctions.map((rt) => (
                                      <DropdownItem key={rt.uri} value={rt.name}>
                                          {rt.name}
                                      </DropdownItem>
                                    ))}
                                </Dropdown></div>
                </div>
              </div>*/}
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
