import Button from '@mui/material/Button';
import {
    CrosswalkConnection, CrosswalkConnectionNew,
    CrosswalkConnectionsNew,
    RenderTree
} from "@app/common/interfaces/crosswalk-connection.interface";
import EastIcon from '@mui/icons-material/East';
import {Dropdown} from "suomifi-ui-components";
import {DropdownItem} from 'suomifi-ui-components';
import {useState, useEffect} from 'react';

export default function NodeMappings(props: { selectedCrosswalk: CrosswalkConnectionNew, performNodeInfoAction: any }) {
    let sourceSelectionInit = '';
    let targetSelectionInit = '';
    console.log('SOURCE DATA', props.selectedCrosswalk.source);
    console.log('TARGET DATA', props.selectedCrosswalk.target);
    console.log('SELECTED', props.selectedCrosswalk);

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

    const filterTargetSelectInit = 'Select a target';
    const filterOperationsSelectInit = 'Select a filter';

    useEffect(() => {
        if (props.selectedCrosswalk.source) {
            sourceSelectionInit = props.selectedCrosswalk.source.id;
            setSourceInputValue(props.selectedCrosswalk.source.id)
        }
        if (props.selectedCrosswalk.target) {
            targetSelectionInit = props.selectedCrosswalk.target.id;
            setTargetInputValue(props.selectedCrosswalk.target.id)
        }
    }, [props]);

    const [sourceInputValue, setSourceInputValue] = useState(sourceSelectionInit);
    const [operation1Value, setOperation1Value] = useState(operationSelectInit);
    const [operation2Value, setOperation2Value] = useState(operationSelectInit);
    const [operation3Value, setOperation3Value] = useState(operationSelectInit);

    const [filterTarget, setFilterTarget] = useState(filterTargetSelectInit);
    const [filterOperation, setFilterOperation] = useState(filterOperationsSelectInit);
    const [filterOperationValue, setFilterOperationValue] = useState('');

    const [targetInputValue, setTargetInputValue] = useState('');
    //const [selectedSource] = props.selectedCrosswalk.source.filter(item => item.id === sourceInputValue);
    //const [selectedTarget] = props.selectedCrosswalk.target.filter(item => item.id === targetInputValue);

    let sourceDropdownInit: any = [
        {
            id: '1'
        },
    ];
    if (props.selectedCrosswalk.source) {
        sourceDropdownInit = props.selectedCrosswalk.source;
    }
    let targetDropdownInit: any = [
        {
            id: '1'
        },
    ];
    if (props.selectedCrosswalk.target) {
        targetDropdownInit = props.selectedCrosswalk.target;
    }

    return (<>
        <div className='col flex-column d-flex justify-content-between'>
            <div className='row bg-light-blue p-2'>
                <div className='col-6'>
                    <div><span className='fw-bold'>Source: </span>{props.selectedCrosswalk.source.name}</div>
                    <div><span className='fw-bold'>Type: </span>{props.selectedCrosswalk.source.type}</div>
                </div>
                <div className='col-6'>
                    <div><span className='fw-bold'>Target: </span>{props.selectedCrosswalk.target.name}</div>
                    <div><span className='fw-bold'>Type: </span>{props.selectedCrosswalk.target.type}</div>
                </div>
            </div>

            {/* OPERATIONS */}
            <div className='row bg-white px-2 py-4'>
                <div><span className='fw-bold'>Operations: </span></div>
                <div className='col-3'>
                    <div><Dropdown className='mt-2 node-info-dropdown'
                                   labelText="Select operation"
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
                <div className='col-3'>
                    <div><Dropdown className='mt-2 node-info-dropdown'
                                   labelText="Select operation"
                                   visualPlaceholder="Operation not selected"
                                   value={operation2Value}
                                   onChange={(newValue) => setOperation2Value(newValue)}
                    >
                        {operationValues.map((rt) => (
                            <DropdownItem key={rt.id} value={rt.name}>
                                {rt.name}
                            </DropdownItem>
                        ))}
                    </Dropdown></div>
                </div>
                <div className='col-3'>
                    <div><Dropdown className='mt-2 node-info-dropdown'
                                   labelText="Select operation"
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

            {/*  FILTERS */}
            <div className='row bg-white px-2 py-4'>
                <div><span className='fw-bold'>Filters: </span></div>
                <div className='col-3'>
                    <div><Dropdown className='mt-2 node-info-dropdown'
                                   labelText="Select target"
                                   visualPlaceholder="Filter target not selected"
                                   value={filterTarget}
                                   onChange={(newValue) => setFilterTarget(newValue)}
                    >
                        {filterValues.map((rt) => (
                            <DropdownItem key={rt.id} value={rt.name}>
                                {rt.name}
                            </DropdownItem>
                        ))}
                    </Dropdown></div>
                </div>
                <div className='col-3'>
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
                </div>
                <div className='col-3'>
                    <div><span className='fw-bold'>Add filter... </span></div>
                </div>
                <div className='col-3'>
                    <div><span className='fw-bold'>Add filter... </span></div>
                </div>
            </div>
        </div>
    </>)
}






















