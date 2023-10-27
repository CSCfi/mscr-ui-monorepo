import Button from '@mui/material/Button';
import {
    CrosswalkConnection,
    CrosswalkConnectionsNew,
    RenderTree
} from "@app/common/interfaces/crosswalk-connection.interface";
import EastIcon from '@mui/icons-material/East';
import {Dropdown} from "suomifi-ui-components";
import {DropdownItem} from 'suomifi-ui-components';
import {useState, useEffect} from 'react';
import Input from '@mui/material/Input';

export default function NodeInfo(props: { isAnySelectedLinked: boolean, isBothSelectedLinked: boolean, sourceData: RenderTree[], targetData: RenderTree[], isSourceTree: boolean, performNodeInfoAction: any }) {
    let sourceSelectionInit = '';
    let targetSelectionInit = '';
    console.log('SOURCE DATA', props.sourceData);
    console.log('TARGET DATA', props.targetData);

    useEffect(() => {
        if (props.sourceData && props.sourceData.length > 0) {
            sourceSelectionInit = props.sourceData[0].id;
            setSourceInputValue(props.sourceData[0].id)
        }
        if (props.targetData && props.targetData.length > 0) {
            targetSelectionInit = props.targetData[0].id;
            setTargetInputValue(props.targetData[0].id)
        }
    }, [props]);

    const [sourceInputValue, setSourceInputValue] = useState(sourceSelectionInit);
    const [targetInputValue, setTargetInputValue] = useState(targetSelectionInit);
    const [selectedSource] = props.sourceData.filter(item => item.id === sourceInputValue);
    const [selectedTarget] = props.targetData.filter(item => item.id === targetInputValue);

    let sourceDropdownInit: any = [
        {
            id: '1'
        },
    ];
    if (props.sourceData && props.sourceData.length > 0) {
        sourceDropdownInit = props.sourceData;
    }
    let targetDropdownInit: any = [
        {
            id: '1'
        },
    ];
    if (props.targetData && props.targetData.length > 0) {
        targetDropdownInit = props.targetData;
    }

    const schemaAttributes = ['description'];

    interface constantAttribute {
        name: string,
        title: string | undefined
    }

    let extraFields: constantAttribute[] = [];

    let foundSourceKeywords: constantAttribute[] = [];
    let fndNum = 0;
    if (props.sourceData.length > 0) {
        // @ts-ignore
        props.sourceData[0]?.children.forEach(item => {
            schemaAttributes.forEach(scAtt => {
                if (Object.prototype.hasOwnProperty.call(item, scAtt)) {
                    fndNum += 1;
                    let attrib: constantAttribute = {
                        name: item.name, title: item['title'] === '' ? 'complex' : item['title']
                    }
                    foundSourceKeywords.push(attrib);
                }
            })
        });
    }

    return (<>
        <div className='row d-flex justify-content-between node-info-box'>

            {/*  SOURCE NODE */}
            {props.isSourceTree && (
                <div className='col flex-column d-flex justify-content-between'>
                    <div className='mb-2'>
                        <Dropdown className='mt-2 node-info-dropdown'
                                  labelText="Selected source node"
                                  visualPlaceholder="Source node not selected"
                                  value={sourceInputValue}
                                  onChange={(newValue) => setSourceInputValue(newValue)}
                        >
                            {sourceDropdownInit.map((rt) => (
                                <DropdownItem key={rt.id} value={rt.id}>
                                    {rt.name}
                                </DropdownItem>
                            ))}
                        </Dropdown>
                    </div>
                    <div className='row'>
                        <div className='col-12'>
                            <div className='fw-bold'>jsonPath:</div>
                            <div>{selectedSource?.jsonPath}</div>
                        </div>
                        {selectedSource?.title &&
                            <div className='col-12'>
                                <div className='fw-bold'>title:</div>
                                <div>{selectedSource?.title}</div>
                            </div>
                        }
                        {selectedSource?.type &&
                            <div className='col-12'>
                                <div className='fw-bold'>type:</div>
                                <div>{selectedSource?.type}</div>
                            </div>
                        }
                        {selectedSource?.description &&
                            <div className='col-12'>
                                <div className='fw-bold'>description:</div>
                                <div>{selectedSource?.description}</div>
                            </div>
                        }
                        {foundSourceKeywords.length < 1 &&
                            <div className='col-12'>
                                <div className='fw-bold'>type:</div>
                                <div>{selectedSource?.type}</div>
                            </div>
                        }
                        {foundSourceKeywords.map(attrib => (
                            <div className='col-12'>
                                <div className='fw-bold'>{attrib.name}:</div>
                                <div className=''>{attrib.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TARGET NODE */}
            {!props.isSourceTree && (
                <div className='col flex-column d-flex justify-content-between'>
                    <div className='mb-2'>
                        <Dropdown className='mt-2 node-info-dropdown'
                                  labelText="Selected target node(s)"
                                  visualPlaceholder="Target node(s) not selected"
                                  value={targetInputValue}
                                  onChange={(newValue2) => setTargetInputValue(newValue2)}
                        >
                            {targetDropdownInit.map((rt) => (
                                <DropdownItem key={rt.id} value={rt.id}>
                                    {rt.name}
                                </DropdownItem>
                            ))}
                        </Dropdown>
                    </div>
                    <div className='row'>
                        <div className='col-12'>
                            <div className='fw-bold'>jsonPath:</div>
                            <div>{selectedTarget?.jsonPath}</div>
                            <br/>
                        </div>
                    </div>
                </div>)}
        </div>
    </>)
}