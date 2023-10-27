import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TreeItem from '@mui/lab/TreeItem';
import {useEffect} from 'react';
import {Text} from 'suomifi-ui-components';
import MockupSchemaLoader from '../crosswalk-editor/schema-mockup';
import {cloneDeep} from 'lodash';
import {useBreakpoints} from 'yti-common-ui/components/media-query';
import TableRow from '@mui/material/TableRow';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import {styled} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddLinkIcon from '@mui/icons-material/AddLink';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import JointListingAccordion from '@app/modules/crosswalk-editor/joint-listing-accordion';
import NodeInfo from '@app/modules/crosswalk-editor/tabs/crosswalk-info/node-info';
import {SearchInput} from 'suomifi-ui-components';
import SchemaTree from '@app/modules/crosswalk-editor/tabs/edit-crosswalk/schema-tree'
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import {
    Button as Sbutton,
    InlineAlert,
    Modal,
    ModalContent,
    ModalFooter,
    ModalTitle,
    Paragraph,
} from 'suomifi-ui-components';
import {fetchCrosswalkData} from "@app/common/components/simple-api-service";
import callback from "@app/pages/api/auth/callback";
import {
    RenderTree,
    CrosswalkConnection,
    CrosswalkConnectionNew,
    CrosswalkConnectionsNew
} from "@app/common/interfaces/crosswalk-connection.interface";
import NodeMappings from './tabs/node-mappings';

export default function CrosswalkEditor() {
    interface simpleNode {
        name: string | undefined;
        id: string;
    }

    const emptyTreeSelection: RenderTree = {
        idNumeric: 0,
        id: '',
        name: '',
        isLinked: false,
        title: '',
        type: '',
        description: '',
        required: '',
        isMappable: '',
        parentName: '',
        jsonPath: "",
        parentId: 0,
        children: [],
    }

    const crosswalkConnectionInit: CrosswalkConnection = {
        description: undefined,
        isSelected: false,
        mappingType: undefined,
        notes: undefined,
        parentId: '',
        parentName: undefined,
        source: "",
        sourceTitle: undefined,
        sourceType: undefined,
        target: "",
        targetTitle: undefined,
        targetType: undefined,
        type: undefined,
    }

    const crosswalkConnectionNewInit: CrosswalkConnectionNew = {
        source: emptyTreeSelection,
        target: emptyTreeSelection,
        id: '0',
        description: '',
        isSelected: false,
        isDraft: false
    }


    const crosswalkConnectionsNewInit: CrosswalkConnectionsNew = {
        source: [emptyTreeSelection],
        target: [emptyTreeSelection],
        id: '0',
        description: '',
    }


    const emptyTree: any = [{
        id: '0',
        name: '',
        children: '',
    }];

    const fromTree = (nodes: any) => (
        <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name} className='linked-tree-item'>
            {Array.isArray(nodes.children)
                ? nodes.children.map((node: any) => fromTree(node))
                : null}
        </TreeItem>
    );

    const emptyTreeTest = () => (
        <TreeItem key="0" nodeId="0" label="test"></TreeItem>
    );

    // STATE VARIABLES
    const [sourceTreeData, setSourceData] = React.useState<RenderTree[]>(MockupSchemaLoader(true));
    const [sourceTreeExpanded, setSourceExpanded] = React.useState<string[]>([]);
    const [sourceTreeSelectedArray, selectFromSourceTreeByIds] = React.useState<string[]>([]);

    const [targetTreeData, setTargetData] = React.useState<RenderTree[]>(MockupSchemaLoader(true));
    const [targetTreeExpanded, setTargetExpanded] = React.useState<string[]>([]);
    const [targetTreeSelectedArray, selectFromTargetTreeByIds] = React.useState<string[]>([]);

    const [selectedSourceNodes, setSelectedSourceNodes] = React.useState<RenderTree[]>([emptyTreeSelection]);
    const [selectedTargetNodes, setSelectedTargetNodes] = React.useState<RenderTree[]>([emptyTreeSelection]);

    const [connectedCrosswalksNew, setConnectedCrosswalksNew] = React.useState<CrosswalkConnectionNew[] | []>([]);

    const [connectedCrosswalksNew2, setConnectedCrosswalksNew2] = React.useState<CrosswalkConnectionsNew[] | []>([]);


    const [isAnySelectedLinked, setAnySelectedLinkedState] = React.useState<boolean>(false);
    const [isBothSelectedLinked, setBothSelectedLinkedState] = React.useState<boolean>(false);
    const [complexLinkingError, setComplexLinkingError] = React.useState<string>('');
    const [simpleLinkingError, setSimpleLinkingError] = React.useState<string>('');
    const [tabValue, setTabValue] = React.useState(0);

    const [crosswalksList, setCrosswalkList] = React.useState<string[]>([]);

    // EXPAND TREES WHEN DATA LOADED
    useEffect(() => {
        setExpanded(true);
    }, [sourceTreeData]);

    useEffect(() => {
        setExpanded(false);
    }, [targetTreeData]);


    useEffect(() => {
        // USED BY NODE INFO BOX SOURCE
        console.log('SRC', getTreeNodesById(sourceTreeSelectedArray, true));
        setSelectedSourceNodes(getTreeNodesById(sourceTreeSelectedArray, true));

        // USED BY NODE INFO BOX TARGET
        console.log('TARGET', getTreeNodesById(targetTreeSelectedArray, true));
        setSelectedTargetNodes(getTreeNodesById(targetTreeSelectedArray, true));

        //updateIsLinkedStatus(sourceNode, targetNode);
        //setSelectedSourceNodes(sourceNode);

    }, [sourceTreeSelectedArray, targetTreeSelectedArray, connectedCrosswalksNew, crosswalksList]);

    // USED BY LINK BUTTON STATE
    useEffect(() => {
        updateSelectionErrors();
    }, [selectedSourceNodes, selectedTargetNodes]);

    function addOrRemoveJoint(add: boolean, isComplexJoint: boolean) {
        if ((add && isComplexJoint && complexLinkingError.length < 1) || (!isComplexJoint && simpleLinkingError.length < 1)) {
            //TODO: check already linked
            let jointsToBeAdded: CrosswalkConnectionNew[] = [];
            let lastJointId = '';
            selectedTargetNodes.forEach(targetNode => {
                selectedSourceNodes[0].id;
                lastJointId = selectedSourceNodes[0].id + '.' + targetNode.id
                const joint = {
                    source: selectedSourceNodes[0],
                    target: targetNode,
                    id: lastJointId,
                    description: '',
                    isSelected: false,
                    isDraft: isComplexJoint,
                }
                jointsToBeAdded.push(joint);
            });

            setConnectedCrosswalksNew(crosswalkMappings => [...crosswalkMappings, ...jointsToBeAdded]);
            if (isComplexJoint) {
                //setJointSelected(lastJointId);
                //changeTab(undefined, 1);
            }
        } else {

            //CALL REMOVE JOINT

        }
    };

    function updateIsLinkedStatus(source: CrosswalkConnection, target: CrosswalkConnection) {
        setAnySelectedLinkedState(source.target.length > 0 || target.target.length > 0);
        setBothSelectedLinkedState(source.target.length > 0 && source.target === target.source);
    }

    function getJointEndNode(nodes: string[], isSourceTree: boolean) {
        let ret: simpleNode = {name: '', id: ''};
        connectedCrosswalksNew.forEach(item => {
            if (isSourceTree) {
                if (item.source.id === nodes.toString()) {
                    ret = {name: item.target.name, id: item.target.id}
                }
            } else {
                if (item.target.id === nodes.toString()) {
                    ret = {name: item.source.name, id: item.source.id}
                }
            }
        });
        return ret;
    }

    function getJointNodes(nodeIds: string[], isSourceTree: boolean) {
        if (isSourceTree) {
            return connectedCrosswalksNew.filter(item => item.source.id === nodeIds.toString());
        } else {
            return connectedCrosswalksNew.filter(item => item.target.id === nodeIds.toString());
        }
    }

    function getTreeNodesById(nodeIds: string[], isSourceTree: boolean) {
        if (isSourceTree) {
            return sourceTreeData.filter(item => nodeIds.includes(item.id));
        } else {
            return targetTreeData.filter(item => nodeIds.includes(item.id));
        }
    }


    function removeJoint(cc: CrosswalkConnectionNew) {
        const newCrosswalks = [...connectedCrosswalksNew.filter(item => {
            return ((item.target !== cc.target) || (item.source !== cc.source));
        })];
        setConnectedCrosswalksNew(() => [...newCrosswalks]);
    }

    function updateJointData(cc: CrosswalkConnectionNew) {
        const newCrosswalks = [...connectedCrosswalksNew.map(item => {
            if ((item.target === cc.target) && (item.source === cc.source)) {
                return (cloneDeep(cc));
            } else {
                return (item)
            }
            ;
        })];
        setConnectedCrosswalksNew(() => [...newCrosswalks]);
    }

    function setJointSelected(nodeId: string) {
        let newCons: CrosswalkConnectionNew[] = [];
        connectedCrosswalksNew.forEach(cw => {
            cw.id === nodeId ? cw.isSelected = true : cw.isSelected = false;
            newCons.push(cw);
        });
        setConnectedCrosswalksNew(newCons);
    }


    function updateSelectionErrors() {
        const uniqueTypes = new Set();
        let complexLinkinError = '';
        let simpleLinkingError = '';

        selectedSourceNodes.forEach((item => {
                uniqueTypes.add(item.type);
            }
        ));
        selectedTargetNodes.forEach((item => {
                uniqueTypes.add(item.type);
            }
        ));
        // SIMPLE NODES CHECK
        if (Array.from(uniqueTypes).length > 1) {
            simpleLinkingError = 'Exact match linking cannot be done when node types mismatch.';
        } else {
            setSimpleLinkingError('');
        }

        // COMPLEX NODES CHECK
        if (selectedSourceNodes.length > 1) {
            complexLinkinError = 'Only one source node can be selected.';
        } else if (selectedTargetNodes.length < 1) {
            complexLinkinError = 'At least one target node must be selected.';
        } else if (selectedSourceNodes.length < 1) {
            complexLinkinError = 'Source node must be selected.';
        }
        setComplexLinkingError(complexLinkinError);
        setSimpleLinkingError(simpleLinkingError.length > 1 ? simpleLinkingError : complexLinkinError);
    }

    const handleTreeSelect = (event: React.SyntheticEvent | undefined, nodeIds: any[], isSourceTree: boolean) => {
        let newTreeSelection: RenderTree[] = [];
        if (isSourceTree) {
            sourceTreeData.forEach((item: RenderTree) => {
                if (item.id === nodeIds.toString()) {
                    newTreeSelection.push(cloneDeep(item));
                }
            });
            //setSourceSelection(newTreeSelection);
            selectFromSourceTreeByIds(nodeIds);
        } else {
            targetTreeData.forEach((item: RenderTree) => {
                if (item.id === nodeIds.toString()) {
                    newTreeSelection.push(cloneDeep(item));
                }
            });
            //setTargetSelection(newTreeSelection);
            selectFromTargetTreeByIds(nodeIds);
        }
    };

    const handleTreeToggle = (event: React.SyntheticEvent, nodeIds: string[], isSourceTree: boolean) => {
        if (isSourceTree) {
            setSourceExpanded(nodeIds);
        } else {
            setTargetExpanded(nodeIds);
        }
    };

    const selectFromTreeById = (nodeId: string, isTargetTree: boolean) => {
        const nodeIds = [];
        nodeIds.push(nodeId);
        if (isTargetTree) {
            selectFromTargetTreeByIds(nodeIds);
        } else {
            selectFromSourceTreeByIds(nodeIds);
        }
    };

    const selectFromTree = (node: CrosswalkConnectionNew, isTargetTree: boolean) => {
        const nodeIds: React.SetStateAction<string[]> = [];
        if (isTargetTree) {
            nodeIds.push(node.target.id);
            selectFromTargetTreeByIds(nodeIds);
            //setTargetSelection(node.target)
        } else {
            nodeIds.push(node.source.id);
            selectFromSourceTreeByIds(nodeIds);
            //setSourceSelection(node.source)
        }
    };

    const handleExpandClick = (isSourceTree: boolean) => {
        const retData: string[] = [];
        if (isSourceTree) {
            sourceTreeData.forEach(({children, id}) => {
                if (children && children?.length > 0) {
                    retData.push(id.toString());
                }
            });
            setSourceExpanded((oldExpanded) => {
                return oldExpanded.length === 0 ? retData : [];
            });
        } else {
            targetTreeData.forEach(({children, id}) => {
                if (children && children?.length > 0) {
                    retData.push(id.toString());
                }
            });
            setTargetExpanded((oldExpanded) => {
                return oldExpanded.length === 0 ? retData : [];
            });
        }
    };

    const setExpanded = (isSourceTree: boolean) => {
        const retData: string[] = [];
        if (isSourceTree) {
            sourceTreeData.forEach(({children, id}) => {
                if (children && children?.length > 0) {
                    retData.push(id.toString());
                }
            });
            setSourceExpanded(() => {
                return retData;
            });
        } else {
            targetTreeData.forEach(({children, id}) => {
                if (children && children?.length > 0) {
                    retData.push(id.toString());
                }
            });
            setTargetExpanded(() => {
                return retData;
            });
        }
    };


    const StyledTableCell = styled(TableCell)(({theme}) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({theme}) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    function saveCroswalk() {
    }

    function loadCroswalk() {
        fetchCrosswalkData('organizations').then(data => {
            setTargetData(MockupSchemaLoader(true));
            setSourceData(MockupSchemaLoader(true));
            setExpanded(true);
            setExpanded(false);
            setConnectedCrosswalksNew([]);
            clearSelections();
        });
    }

    function filterTreeData(treeData: RenderTree[], keywords: string[], index: number, isSourceTree: boolean) {
        let ret = undefined;
        treeData = treeData.filter((elem: { name: string, jsonPath: string }) => {
            if (elem.jsonPath.startsWith(keywords[index])) {
                return elem;
            }
        });

        if (treeData[0] && treeData[0].jsonPath === keywords[keywords.length - 1]) {
            ret = cloneDeep(buildPathToSubtrees(treeData, isSourceTree));
            console.log('BUILT PATH', ret);
        }

        if (treeData[0]?.children && treeData[0].children.length > 0) {
            filterTreeData(treeData[0].children, keywords, index + 1, isSourceTree)
        }
    }

    function buildPathToSubtrees(treeData: RenderTree[], isSourceTree: boolean) {
        let jsonPathReady: string[] = [];
        let jsonPathPieces = treeData[0].jsonPath.split('.');
        let prev = '';

        for (let i = 0; i < jsonPathPieces.length; i += 1) {
            if (i > 0) {
                prev = prev + '.' + jsonPathPieces[i];
                jsonPathReady.push(prev);
            } else {
                prev = jsonPathPieces[i];
                jsonPathReady.push(prev);
            }
        }

        let pathObjects: RenderTree[] = [];
        if (isSourceTree) {
            sourceTreeData.forEach(elem => {
                if (jsonPathReady.includes(elem.jsonPath)) {
                    console.log('final match', elem);
                    pathObjects.push(elem);
                }
            });
            setSourceData(pathObjects);
            return pathObjects;
        } else {
            targetTreeData.forEach(elem => {
                if (jsonPathReady.includes(elem.jsonPath)) {
                    console.log('final match', elem);
                    pathObjects.push(elem);
                }
            });
            setTargetData(pathObjects);
            return pathObjects;
        }
    }

    function processSubtree() {

    }

    function clearTreeSearch(isSourceTree: boolean) {
        if (isSourceTree) {
            // @ts-ignore
            setSourceData(MockupSchemaLoader(true));
            setExpanded(true);
        } else {
            // @ts-ignore
            setTargetData(MockupSchemaLoader(true));
            setExpanded(false);
        }
    }

    function searchFromTree(input: any, isSourceTree: boolean) {
        //setSourceData(MockupSchemaLoader(true));
        let treeDataNew: any;

        const hits: string[] = [];

        if (isSourceTree) {
            sourceTreeData.forEach((elem: { name: string, jsonPath: string }) => {
                if (elem.name.includes(input.toString())) {
                    console.log('SEARCH RESULT:', elem.jsonPath);
                    hits.push(elem.jsonPath);
                }
            });
        } else {
            targetTreeData.forEach((elem: { name: string, jsonPath: string }) => {
                if (elem.name.includes(input.toString())) {
                    console.log('SEARCH RESULT:', elem.jsonPath);
                    hits.push(elem.jsonPath);
                }
            });
        }

        let nodesToProcess: string[][] = [];
        hits.forEach(hit => {
            const treeNodeNames = hit.split('.');
            treeNodeNames.forEach(node => {
            });
            nodesToProcess.push(treeNodeNames)
        });

        const nodesToProcessUnique: Set<string> = new Set();

        nodesToProcess.forEach(path => {
            let prev = '';
            for (let i = 0; i < path.length; i += 1) {
                if (i > 0) {
                    prev = prev + '.' + path[i];
                    nodesToProcessUnique.add(prev);
                } else {
                    prev = path[i];
                    nodesToProcessUnique.add(prev);
                }
            }
        });
        // FOUND MATCHING SUBTREES
        treeDataNew = filterTreeData(isSourceTree ? sourceTreeData : targetTreeData, Array.from(nodesToProcessUnique), 0, isSourceTree);

        if (treeDataNew && treeDataNew.length > 0) {
            if (isSourceTree) {
                //setSourceData(treeDataNew)
            } else {
                //setTargetData(treeDataNew)
            }
        }
    }

    function clearSelections() {
        selectFromSourceTreeByIds([]);
        selectFromTargetTreeByIds([]);
    }

    const performCallbackFromAccordionAction = (joint: any, action: string, value: string) => {
        if (action === 'remove') {
            removeJoint(joint);
        } else if (action === 'addNotes') {
            joint.notes = value;
            updateJointData(joint);
        } else if (action === 'selectFromSourceTree') {
            //handleExpandClick(true);
            clearTreeSearch(true);
            selectFromTree(joint, false);
            changeTab(undefined, 0);
        } else if (action === 'selectFromTargetTree') {
            //handleExpandClick(false);
            clearTreeSearch(false);
            selectFromTree(joint, true);
            changeTab(undefined, 0);
        } else if (action === 'openJointDetails') {
            setJointSelected(joint.id);
            changeTab(undefined, 1);
            scrollToTop();
        }
    };

    const performCallbackFromTreeAction = (isSourceTree: boolean, action: any, event: any, nodeIds: any) => {
        if (action === 'handleSelect') {
            handleTreeSelect(event, nodeIds, isSourceTree);
        } else if (action === 'treeToggle') {
            handleTreeToggle(event, nodeIds, isSourceTree);
        }

    }

    interface TabPanelProps {
        children?: React.ReactNode;
        index: number;
        value: number;
    }

    function CustomTabPanel(props: TabPanelProps) {
        const {children, value, index, ...other} = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{p: 3}}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    function a11yProps(index: number) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const changeTab = (event: React.SyntheticEvent | undefined, newValue: number) => {
        setTabValue(newValue);
    };

    const performNodeInfoAction = (nodeId: any, isSourceTree: boolean) => {
        selectFromTreeById(nodeId, isSourceTree);
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <><Box className='mb-3' sx={{borderBottom: 1, borderColor: 'divider'}}>
            <Tabs value={tabValue} onChange={changeTab} aria-label="Category selection">
                <Tab label="Node selection" {...a11yProps(0)} />
                <Tab label="Node mappings" {...a11yProps(2)} />
                <Tab label="Crosswalk info" {...a11yProps(2)} />
                <Tab label="Version history" {...a11yProps(3)} />
            </Tabs>
        </Box>
            {/*            <CustomTabPanel value={tabValue} index={0}>
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={1}>
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={2}>
            </CustomTabPanel>*/}
            <div className='row d-flex justify-content-between mt-4'>
                {/*  LEFT COLUMN */}
                <div className='col-12'>
                    {tabValue === 0 &&
                        <>
                            <div className='row gx-0'>
                            </div>
                            <div className='row gx-0'>
                                {/*  SOURCE TREE */}
                                <div className='col-6 px-4'>
                                    <div>
                                        <div className="row content-box">
                                            <div className="col-7 content-box px-0">
                                                <div className="d-flex justify-content-between mb-2 ps-3 pe-2">
                                                    <div>
                                                        <SearchInput
                                                            className="py-2"
                                                            labelText="Filter from source schema"
                                                            searchButtonLabel="Search"
                                                            clearButtonLabel="Clear"
                                                            visualPlaceholder="Find an attribute..."
                                                            onSearch={(value) => {
                                                                searchFromTree(value, true)
                                                            }}
                                                            onChange={(value) => {
                                                                if (!value){
                                                                    clearTreeSearch(true);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="">
                                                        <IconButton onClick={() => handleExpandClick(true)}
                                                                    aria-label="unlink"
                                                                    color="primary" size="large">
                                                            {sourceTreeExpanded.length === 0 ? <ExpandMoreIcon/> :
                                                                <ExpandLessIcon/>}
                                                        </IconButton>
                                                    </div>
                                                </div>

                                                <Box sx={{height: 400, flexGrow: 1, maxWidth: 700, overflowY: 'auto'}}>

                                                    <SchemaTree nodes={sourceTreeData[0]}
                                                                isSourceTree={true}
                                                                treeSelectedArray={sourceTreeSelectedArray}
                                                                treeExpanded={sourceTreeExpanded}
                                                                performTreeAction={performCallbackFromTreeAction}
                                                    />

                                                </Box></div>
                                            <div className="col-5 content-box px-0">
                                                <Box sx={{height: 500, flexGrow: 1, maxWidth: 400, overflowY: 'auto'}}>
                                                    <NodeInfo isAnySelectedLinked={isAnySelectedLinked}
                                                              isBothSelectedLinked={isBothSelectedLinked}
                                                              sourceData={selectedSourceNodes}
                                                              isSourceTree={true}
                                                              targetData={selectedTargetNodes}
                                                              performNodeInfoAction={performNodeInfoAction}></NodeInfo>
                                                </Box>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/*  TARGET TREE */}
                                <div className='col-6 px-4'>
                                    <div>
                                        <div className="row content-box">
                                            <div className="col-7 content-box px-0">
                                                <div className="d-flex justify-content-between mb-2 ps-3 pe-2">
                                                    <div>
                                                        <SearchInput
                                                            className="py-2"
                                                            labelText="Filter from target schema"
                                                            searchButtonLabel="Search"
                                                            clearButtonLabel="Clear"
                                                            onSearch={(value) => {
                                                                searchFromTree(value, false)
                                                            }}
                                                            visualPlaceholder="Find an attribute..."
                                                            onChange={(value) => {
                                                                if (!value){
                                                                    clearTreeSearch(false);
                                                                }
                                                            }}
                                                        />

                                                    </div>
                                                    <div className="">
                                                        <IconButton onClick={() => handleExpandClick(false)}
                                                                    aria-label="unlink"
                                                                    color="primary" size="large">
                                                            {targetTreeExpanded.length === 0 ? <ExpandMoreIcon/> :
                                                                <ExpandLessIcon/>}
                                                        </IconButton>
                                                    </div>
                                                </div>

                                                <Box sx={{height: 400, flexGrow: 1, maxWidth: 700, overflowY: 'auto'}}>

                                                    <SchemaTree nodes={targetTreeData[0]}
                                                                isSourceTree={false}
                                                                treeSelectedArray={targetTreeSelectedArray}
                                                                treeExpanded={targetTreeExpanded}
                                                                performTreeAction={performCallbackFromTreeAction}
                                                    />

                                                </Box></div>
                                            <div className="col-5 content-box px-0">
                                                <Box sx={{height: 230, flexGrow: 1}}>
                                                    <NodeInfo isAnySelectedLinked={isAnySelectedLinked}
                                                              isBothSelectedLinked={isBothSelectedLinked}
                                                              sourceData={selectedSourceNodes}
                                                              isSourceTree={false}
                                                              targetData={selectedTargetNodes}
                                                              performNodeInfoAction={performNodeInfoAction}></NodeInfo>
                                                </Box>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    {tabValue === 1 && <>
                        <NodeMappings selectedCrosswalk={connectedCrosswalksNew[0]}
                                      performNodeInfoAction={performNodeInfoAction}></NodeMappings>
                    </>}
                </div>

                {/*  BOTTOM COLUMN */}
                {/*  ACTIONS */}
                <div className='col-2 px-4 mt-4'>
                    {tabValue === 0 &&<>
                        <h5>Mapping actions</h5>
                        <div className='d-flex align-content-center justify-content-center flex-column node-selection-action-buttons'>
                            <div className='d-flex justify-content-center'>
                                <IconButton onClick={() => addOrRemoveJoint(!isBothSelectedLinked, false)}
                                            className={(simpleLinkingError.length > 1 ? 'actions-link-icon actions-error' : 'actions-link-icon')}
                                            title={(simpleLinkingError.length > 1 ? simpleLinkingError : 'Link selected nodes (simple map)')}
                                            aria-label={(!isBothSelectedLinked ? 'Link selected nodes' : 'Unlink selected nodes')}
                                            color="primary" size="large"

                                >
                                    {isBothSelectedLinked ? <LinkOffIcon/> : <AddLinkIcon/>}
                                </IconButton>
                            </div>
                            <div className='d-flex justify-content-center'>
                                <IconButton onClick={() => addOrRemoveJoint(true, true)}
                                            className={(complexLinkingError.length > 1 ? 'actions-link-icon actions-error' : 'actions-link-icon')}
                                            title={(complexLinkingError.length > 1 ? complexLinkingError : 'Link selected nodes (complex map)')}
                                            aria-label={(!isBothSelectedLinked ? 'Link selected nodes' : 'Unlink selected nodes')}
                                            color="primary" size="medium"

                                >
                                    <AccountTreeIcon/>
                                </IconButton>
                            </div>
                        </div>
                    </>}
                </div>
                <div className='col-8 px-4 mt-4'>
                    <h5>Mappings</h5>
                    <div className='joint-listing-accordion-wrap'>
                        <Box className='mb-4' sx={{height: 640, flexGrow: 1, overflowY: 'auto'}}>
                            <JointListingAccordion crosswalkJoints={connectedCrosswalksNew}
                                                   performAccordionAction={performCallbackFromAccordionAction}></JointListingAccordion>
                        </Box>
                    </div>
                </div>
                <div className='col-2 px-4 mt-4'>
                    <h5>General actions</h5>
                    {/* <div className='col-4'><Sbutton onClick={() => {
                                loadCroswalk();
                            }}>Load</Sbutton>
                            </div>*/}
                    <div className='col-12 pt-3'><Sbutton onClick={() => {
                        loadCroswalk();
                    }}>Save</Sbutton>
                    </div>
                    <div className='col-12 pt-2'><Sbutton onClick={() => {
                        saveCroswalk();
                    }}>Publish</Sbutton>
                    </div>
                </div>
            </div>
            <hr></hr>
        </>
    );
}
