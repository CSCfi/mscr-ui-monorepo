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
import Box from '@mui/material/Box';

export default function NodeInfo(props: { isAnySelectedLinked: boolean, isBothSelectedLinked: boolean, sourceData: RenderTree[], targetData: RenderTree[], isSourceTree: boolean, performNodeInfoAction: any }) {
    let sourceSelectionInit = '';
    let targetSelectionInit = '';

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

    let foundSourceKeywords: constantAttribute[] = [];
    if (props.sourceData.length > 0) {
        // @ts-ignore
        props.sourceData[0]?.children.forEach(item => {
            schemaAttributes.forEach(scAtt => {
                if (Object.prototype.hasOwnProperty.call(item, scAtt)) {
                    let attrib: constantAttribute = {
                        name: item.name, title: item['title'] === '' ? 'complex' : item['title']
                    }
                    foundSourceKeywords.push(attrib);
                }
            })
        });
    }

    let foundTargetKeywords: constantAttribute[] = [];
    if (props.sourceData.length > 0) {
        // @ts-ignore
        props.targetData[0]?.children.forEach(item => {
            schemaAttributes.forEach(scAtt => {
                if (Object.prototype.hasOwnProperty.call(item, scAtt)) {
                    let attrib: constantAttribute = {
                        name: item.name, title: item['title'] === '' ? 'complex' : item['title']
                    }
                    foundTargetKeywords.push(attrib);
                }
            })
        });
    }

    return (<>
        <div className='row d-flex justify-content-between node-info-box'>
            <h2 className='pt-3 px-3'>Selected node info</h2>

            {/*  SOURCE NODE */}
            {props.isSourceTree && (
                <div className='col flex-column d-flex justify-content-between side-bar-wrap'>
                    <div className='mb-2'>
                        <div className='dropdown-wrap'>
                        <Dropdown className='mt-2 node-info-dropdown'
                                  visualPlaceholder="Source node(s) not selected"
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
                    </div>
                    <Box sx={{height: 380, flexGrow: 1, maxWidth: 400, overflowY: 'auto'}}>
                    <div className='bg-wrap'>
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
                    </Box>
                </div>
            )}

            {/* TARGET NODE */}
            {!props.isSourceTree && (
                <div className='col flex-column d-flex justify-content-between side-bar-wrap'>
                    <div className='mb-2'>
                        <div className='dropdown-wrap'>
                            <Dropdown className='mt-2 node-info-dropdown'
                                      visualPlaceholder="Target node not selected"
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
                    </div>
                    <Box sx={{height: 380, flexGrow: 1, maxWidth: 400, overflowY: 'auto'}}>
                    <div className='bg-wrap'>
                        <div className='row'>
                            <div className='col-12'>
                                <div className='fw-bold'>jsonPath:</div>
                                <div>{selectedTarget?.jsonPath}</div>
                            </div>

                            {selectedTarget?.type &&
                                <div className='col-12'>
                                    <div className='fw-bold'>type:</div>
                                    <div>{selectedTarget?.type}</div>
                                </div>
                            }
                            <div className='row'>
                                {foundTargetKeywords.map(attrib => (
                                    <div className='col-12'>
                                        <div className='fw-bold'>{attrib.name}:</div>
                                        <div className=''>{attrib.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    </Box>
                </div>)}
        </div>
    </>)
}