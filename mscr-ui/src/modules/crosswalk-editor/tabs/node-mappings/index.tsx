import {
    CrosswalkConnection, CrosswalkConnectionNew,
    CrosswalkConnectionsNew,
    RenderTree
} from "@app/common/interfaces/crosswalk-connection.interface";
import validateMapping from "@app/modules/crosswalk-editor/mapping-validator";
import EastIcon from '@mui/icons-material/East';
import {Dropdown, TextInput} from "suomifi-ui-components";
import {DropdownItem} from 'suomifi-ui-components';
import { useCallback, useEffect, useState } from 'react';
import {
    Button,
    InlineAlert,
    Modal,
    ModalContent,
    ModalFooter,
    ModalTitle,
    Paragraph,
} from 'suomifi-ui-components';
import CrosswalkForm from "@app/modules/crosswalk-form";
import FormFooterAlert from "../../../../../../common-ui/components/form-footer-alert";
import {useBreakpoints} from "../../../../../../common-ui/components/media-query";

export default function NodeMappings(props: { selectedCrosswalk: CrosswalkConnectionNew | undefined, performNodeInfoAction: any, filterFunctions: any, modalOpen: boolean, isFirstAdd: boolean }) {
    let sourceSelectionInit = '';
    let targetSelectionInit = '';
    console.log('SOURCE DATA', props?.selectedCrosswalk?.source);
    console.log('TARGET DATA', props?.selectedCrosswalk?.target);
    console.log('SELECTED', props?.selectedCrosswalk);

    const { isSmall } = useBreakpoints();

    let operationValues = [
        {
            name: 'Operation 1',
            id: 1,
        },
        {
            name: 'Operation 2',
            id: 2,
        }
    ];

    let filterValues = [
        {
            name: 'Filter 1',
            id: 1,
        },
        {
            name: 'Filter 2',
            id: 2,
        }
    ];

    let filterOperations= [
        {
            name: 'Filter operation 1',
            id: 1,
        },
        {
            name: 'Filter operation 2',
            id: 2,
        }
    ];
    const operationSelectInit = 'Operation 1';

    const filterTargetSelectInit = '';
    const filterOperationsSelectInit = 'Filter operation 1';

    useEffect(() => {
        if (props?.selectedCrosswalk?.source) {
            sourceSelectionInit = props.selectedCrosswalk.source.id;
            setSourceInputValue(props.selectedCrosswalk.source.id)
        }
        if (props?.selectedCrosswalk?.target) {
            targetSelectionInit = props.selectedCrosswalk.target.id;
            setTargetInputValue(props.selectedCrosswalk.target.id)
        }
        setVisible(props.modalOpen);
    }, [props]);

    const [sourceInputValue, setSourceInputValue] = useState(sourceSelectionInit);
    const [operation1Value, setOperation1Value] = useState(operationSelectInit);
    const [mappingOperationValue, setMappingOperationValue] = useState('');
    const [operation3Value, setOperation3Value] = useState(operationSelectInit);

    const [filterTarget, setFilterTarget] = useState(filterTargetSelectInit);
    const [filterOperation, setFilterOperation] = useState(filterOperationsSelectInit);
    const [filterOperationValue, setFilterOperationValue] = useState('');

    const [targetInputValue, setTargetInputValue] = useState('');
    //const [selectedSource] = props.selectedCrosswalk.source.filter(item => item.id === sourceInputValue);
    //const [selectedTarget] = props.selectedCrosswalk.target.filter(item => item.id === targetInputValue);

    const [visible, setVisible] = useState(props.modalOpen);
    const [filterDetailsVisible, setFilterDetailsVisible] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    function closeModal(){
        props.performNodeInfoAction('closeModal', null, null);
    };

    function setSourceFilterValue(value: any){
        console.log('setting source fitler value', value);
    }

    function save() {
        console.log('validation errors', validationErrors);
        props.performNodeInfoAction('save', props.selectedCrosswalk, null);

    };

    // CLEAR FIELDS WHEN MODAL OPENED
    useEffect(() => {
        setSourceInputValue(sourceSelectionInit);
        setOperation1Value(operationSelectInit);
        setMappingOperationValue('');
        setOperation3Value(operationSelectInit);
        setFilterTarget(filterTargetSelectInit);
        setFilterOperation(filterOperationsSelectInit);
    }, [visible]);

    // VALIDATE MAPPING
    useEffect(() => {
        setValidationErrors(validateMapping(props.selectedCrosswalk));
    }, [setOperation1Value, setMappingOperationValue, setOperation3Value, setFilterTarget, setFilterOperation]);

    return (<>
        <Modal
            appElementId="__next"
            visible={visible}
            onEscKeyDown={() => closeModal()}
            className='row bg-white edit-mapping-modal'
        >
            <ModalContent className='edit-mapping-modal-content'>
                <ModalTitle>{'Edit mapping'}</ModalTitle>
                <div className='col flex-column d-flex justify-content-between'>

                    {/* OPERATIONS */}
                    <div className='row bg-white'>
                        <div className='col-4'>
                            <div className='bg-light-blue p-2'>
                                <p><span className='fw-bold'>Source: </span>{props.selectedCrosswalk.source.name}</p>
                                <p><span className='fw-bold'>Type: </span>{props.selectedCrosswalk.source.type}</p>
                                <p><span className='fw-bold'>Description: </span>{props.selectedCrosswalk.source?.description ? props.selectedCrosswalk.source?.description : 'N/A' }</p>

                                <span hidden={filterDetailsVisible}>
                                <Button
                                    icon="plus"
                                    style={{ height: 'min-content' }}
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
                                    {filterValues.map((rt) => (
                                        <DropdownItem key={rt.id} value={rt.name}>
                                            {rt.name}
                                        </DropdownItem>
                                    ))}
                                </Dropdown>
                                    <TextInput
                                        onChange={(value) => setSourceFilterValue('uri', value)}
                                        visualPlaceholder="Value"
                                    />
                                </div>
                                <div><Dropdown className='mt-2 node-info-dropdown'
                                               labelText="Source operation"
                                               visualPlaceholder="Operation not selected"
                                               value={operation1Value}
                                               onChange={(newValue) => setOperation1Value(newValue)}
                                >
                                    {operationValues.map((rt) => (
                                        <DropdownItem key={rt.id} value={rt.name}>
                                            {rt.name}
                                        </DropdownItem>
                                    ))}
                                </Dropdown></div>
                            </div>
                        </div>
                        <div className='col-4'>

                            <div><Dropdown className='mt-2 node-info-dropdown'
                                           labelText="Mapping operation"
                                           visualPlaceholder="Operation not selected"
                                           value={mappingOperationValue}
                                           onChange={(newValue) => setMappingOperationValue(newValue)}
                            >
                                {props?.filterFunctions.map((rt) => (
                                    <DropdownItem key={rt.uri} value={rt.name}>
                                        {rt.name}
                                    </DropdownItem>
                                ))}
                            </Dropdown></div>
                        </div>
                        <div className='col-4'>
                            <div className='bg-light-blue p-2'>
                                <p><span className='fw-bold'>Target: </span>{props.selectedCrosswalk.target.name}</p>
                                <p><span className='fw-bold'>Type: </span>{props.selectedCrosswalk.target.type}</p>
                                <p><span className='fw-bold'>Description: </span>{props.selectedCrosswalk.target?.description ? props.selectedCrosswalk.target?.description : 'N/A' }</p>
                                <br/>
                                <div><Dropdown className='mt-2 node-info-dropdown'
                                               labelText="Select filter"
                                               visualPlaceholder="Filter not selected"
                                               value={filterOperation}
                                               onChange={(newValue) => setFilterOperation(newValue)}
                                >
                                    {filterOperations.map((rt) => (
                                        <DropdownItem key={rt.id} value={rt.name}>
                                            {rt.name}
                                        </DropdownItem>
                                    ))}
                                </Dropdown></div>
                                <div><Dropdown className='mt-2 node-info-dropdown'
                                               labelText="Target operation"
                                               visualPlaceholder="Operation not selected"
                                               value={operation3Value}
                                               onChange={(newValue) => setOperation3Value(newValue)}
                                >
                                    {operationValues.map((rt) => (
                                        <DropdownItem key={rt.id} value={rt.name}>
                                            {rt.name}
                                        </DropdownItem>
                                    ))}
                                </Dropdown></div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalContent>
            <ModalFooter>
                <Button
                    style={{ height: 'min-content' }}
                    onClick={() => save()}
                    disabled={mappingOperationValue.length < 1}
                >
                    {'Save'}
                </Button>
                <Button
                    style={{ height: 'min-content' }}
                    variant="secondary"
                    onClick={() => closeModal()}
                >
                    {'Cancel'}
                </Button>
            </ModalFooter>
        </Modal>
    </>)
}






















