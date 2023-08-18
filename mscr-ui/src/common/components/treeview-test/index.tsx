import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import {useEffect} from 'react';
import {Text} from 'suomifi-ui-components';
import SchemaLoader from '../crosswalk-edit/schema-mockup';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {cloneDeep} from 'lodash';
import {useBreakpoints} from 'yti-common-ui/components/media-query';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import {styled} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddLinkIcon from '@mui/icons-material/AddLink';

export default function TreeviewTest() {

    interface crosswalkConnection {
        source: string;
        target: string;
        sourceTitle: string;
        targetTitle: string;
        type: string;
    }

    interface simpleNode {
        name: string;
        id: string;
    }

    const crosswalkConnectionInit = {
        source: '',
        target: '',
        sourceTitle: '',
        targetTitle: '',
        type: ''
    };

    // TREE STATE VARIABLES
    const [sourceTreeExpanded, setExpanded] = React.useState<string[]>([]);
    const [sourceTreeSelectedArray, setSourceSelected] = React.useState<string[]>([]);
    const [sourceTreeSelectionTitle, setSourceSelectedTitle] = React.useState<string>('');

    const [targetTreeExpanded, setTargetExpanded] = React.useState<string[]>([]);
    const [targetTreeSelectedArray, setTargetSelected] = React.useState<string[]>([]);
    const [targetTreeSelectionTitle, setTargetSelectedTitle] = React.useState<string>('');

    const [currentlySelectedSource, setCurrentlySelectedSource] = React.useState<crosswalkConnection>(crosswalkConnectionInit);
    const [currentlySelectedTarget, setCurrentlySelectedTarget] = React.useState<crosswalkConnection>(crosswalkConnectionInit);

    const [connectedCrosswalks, setConnectedCrosswalks] = React.useState<crosswalkConnection[]>([]);
    const [isAnySelectedLinked, setAnySelectedLinkedState] = React.useState<boolean>(false);
    const [isBothSelectedLinked, setBothSelectedLinkedState] = React.useState<boolean>(false);
    const [isDataLoaded, setDataLoaded] = React.useState<boolean>(false);

    const [crosswalksList, setCrosswalkList] = React.useState<string[]>([]);

    const crosswalkVisual: string[] = [];

    // PROCESS SOURCE TREE SELECTION
    useEffect(() => {
        const sourceNode : crosswalkConnection = Object.assign({}, crosswalkConnectionInit);
        sourceNode.source = sourceTreeSelectedArray.toString();
        sourceNode.sourceTitle = sourceTreeSelectionTitle;
        const target = getJointEndNode(sourceTreeSelectedArray, true);
        sourceNode.targetTitle = target.name;
        sourceNode.target = target.id;
        console.log('%%%%%%%%%%%%%%%%%%%%%% CURRENT SOURCE', sourceNode);

        const targetNode : crosswalkConnection = Object.assign({}, crosswalkConnectionInit);
        targetNode.source = targetTreeSelectedArray.toString();
        targetNode.sourceTitle = targetTreeSelectionTitle;
        const source = getJointEndNode(targetTreeSelectedArray, false);
        targetNode.targetTitle = source.name;
        targetNode.target = source.id;
        console.log('%%%%%%%%%%%%%%%%%%%%%% CURRENT TARGET', targetNode);

        updateIsLinkedStatus(sourceNode, targetNode);
        setCurrentlySelectedSource(sourceNode);
        setCurrentlySelectedTarget(targetNode);

    }, [sourceTreeSelectedArray, targetTreeSelectedArray, crosswalksList, isAnySelectedLinked, isBothSelectedLinked]);


    // RENDER CROSSWALKS AFTER CHANGE
    useEffect(() => {
        renderCrosswalksList();
    }, [connectedCrosswalks]);

    const crosswalkMappings: crosswalkConnection[] = [];
    const sourceData = SchemaLoader();
    const targetData = SchemaLoader();

    function addOrRemoveJoint(add: boolean) {
        if (add) {
            setConnectedCrosswalks(crosswalkMappings => [...crosswalkMappings, {
                source: sourceTreeSelectedArray.toString(),
                target: targetTreeSelectedArray.toString(),
                sourceTitle: sourceTreeSelectionTitle,
                targetTitle: targetTreeSelectionTitle,
                type: '',
            }]);
        } else {
            removeJoint({
                source: sourceTreeSelectedArray.toString(),
                target: targetTreeSelectedArray.toString(),
                sourceTitle: sourceTreeSelectionTitle,
                targetTitle: targetTreeSelectionTitle,
                type: '',
            });
        }
    };

    function renderCrosswalksList() {
        connectedCrosswalks.forEach((item: crosswalkConnection) => {
            crosswalkVisual.push(item.sourceTitle, item.targetTitle);
            setCrosswalkList([...crosswalkVisual]);
        });
    }

    function updateIsLinkedStatus(source: crosswalkConnection, target: crosswalkConnection) {
        setAnySelectedLinkedState(source.target.length > 0 || target.target.length > 0);
        setBothSelectedLinkedState(source.target.length > 0 && source.target === target.source);
    }

    function getJointEndNode(nodes: string[], isSourceTree: boolean) {
        const ret :simpleNode = {name: '', id: ''};
        connectedCrosswalks.forEach(item => {
            if (isSourceTree) {
                if (item.source === nodes.toString()) {
                    ret.name = item.targetTitle;
                    ret.id = item.target;
                }
            } else if (item.target === nodes.toString()) {
                ret.name = item.sourceTitle;
                ret.id = item.source;
            }
        });
        return ret;
    }

    function getJointTitle(nodeIds: string[], isSourceTree: boolean) {
        const ret: string[] = [];
        connectedCrosswalks.forEach(item => {
            if (isSourceTree) {
                if (item.source === nodeIds[0].toString()) {
                    ret.push(item.sourceTitle);
                    ret.push(item.targetTitle);
                }
            } else if (item.target === nodeIds[0]) {
                ret.push(item.sourceTitle);
                ret.push(item.targetTitle);
            }
        });
        return ret;
    }

    function removeJoint(cc: crosswalkConnection) {
        console.log('remove joint called', cc);
        const newCrosswalks = [...connectedCrosswalks.filter(item => {
            return ((item.target !== cc.target) || (item.source !== cc.source));
        })];
        setConnectedCrosswalks(crosswalkMappings => [...newCrosswalks]);
    }

    function canBeJoined(from: crosswalkConnection, to: crosswalkConnection) {
        return (from.type === to.type);
    }

    const handleSourceToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
        setExpanded(nodeIds);
    };

    const handleSourceSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
        setSourceSelectedTitle(event.target?.outerText);
        setSourceSelected(nodeIds);
    };

    const handleTargetToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
        setTargetExpanded(nodeIds);
    };

    const handleTargetSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
        setTargetSelectedTitle(event.target?.outerText);
        setTargetSelected(nodeIds);
    };

    const selectFromTree = (nodeId: string, isTargetTree: boolean) => {
        const nodeIds = [];
        nodeIds.push(nodeId);
        if (isTargetTree) {
            setTargetSelected(nodeIds);
            setTargetSelectedTitle(getJointTitle(nodeIds, false)[1]);
        } else {
            setSourceSelected(nodeIds);
            setSourceSelectedTitle(getJointTitle(nodeIds, true)[0]);
        };
    };

    const handleExpandClick = (isSourceTree: boolean) => {
        const retData: string[] = [];
        if (isSourceTree) {
            sourceData.forEach(item => {
                if (item.children?.length > 0) {
                    retData.push(item.id.toString());
                }
            });
            setExpanded((oldExpanded) => {
                return oldExpanded.length === 0 ? retData : [];
            });
        } else {
            targetData.forEach(item => {
                if (item.children?.length > 0) {
                    retData.push(item.id.toString());
                }
            });
            setTargetExpanded((oldExpanded) => {
                return oldExpanded.length === 0 ? retData : [];
            });
        }
    };

    const sourceDataDef = [{
        id: '0',
        name: 'Parent',
        children: [
            {
                id: '1',
                name: 'Source - 1',
                children: [],
            },
            {
                id: '3',
                name: 'Source - 3',
                children: [
                    {
                        id: '4',
                        name: 'Source - 4',
                    },
                ],
            },
        ],
    }];

    const targetDataDef: any = {
        id: '0',
        name: 'Parent',
        children: [
            {
                id: '1',
                name: 'Target - 1',
            },
            {
                id: '3',
                name: 'Target - 3',
                children: [
                    {
                        id: '4',
                        name: 'Target - 4',
                    },
                ],
            },
        ],
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

    function LinkedNodesTable() {
        const {breakpoint} = useBreakpoints();
        return (
            <Table sx={{minWidth: 200}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell className='fw-bold' style={{width: '40%'}}>Source</StyledTableCell>
                        <StyledTableCell className='fw-bold' style={{width: '20%'}} align="left"></StyledTableCell>
                        <StyledTableCell className='fw-bold' style={{width: '40%'}}
                                         align="left">Target</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {connectedCrosswalks.map((node: crosswalkConnection) => (
                        // eslint-disable-next-line react/jsx-key
                        <StyledTableRow
                            key={node.source}
                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                            <StyledTableCell className='p-0' component="th" scope="row">
                                <Button style={{textTransform: 'none'}}
                                        onClick={() => selectFromTree(node.source, false)}>{node.sourceTitle}</Button>
                            </StyledTableCell>
                            <StyledTableCell className='p-0' align="left">
                                <IconButton onClick={() => removeJoint(node)} aria-label="unlink" color="primary"
                                            size="large">
                                    <LinkOffIcon/>
                                </IconButton>
                            </StyledTableCell>
                            <StyledTableCell className='p-0' align="left"><Button style={{textTransform: 'none'}}
                                                                                  onClick={() => selectFromTree(node.target, true)}>{node.targetTitle}</Button>
                            </StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }


    // RENDER TREES
    const fromTree = (nodes: any) => (
        <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
            {Array.isArray(nodes.children)
                ? nodes.children.map((node: any) => fromTree(node))
                : null}
        </TreeItem>
    );

    const toTree = (nodes: any) => (
        <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
            {Array.isArray(nodes.children)
                ? nodes.children.map((node: any) => toTree(node))
                : null}
        </TreeItem>
    );

    return (
        <>
            <div className='row d-flex justify-content-between'>
                {/*  LEFT COLUMN */}
                <div className='col-8'>
                    <h5>Node information</h5>
                    <div className='row d-flex justify-content-between bg-white p-2'>

                        {/*  SOURCE NODE */}
                        <div className='col-5 flex-column d-flex'>
                            <div className='fw-bold'>Source node:</div>
                            <div>{currentlySelectedSource.sourceTitle}</div>
                            {currentlySelectedSource.target &&
                                <Text>is linked to <Button className='px-0' style={{textTransform: 'none'}}
                                                           onClick={() => {
                                                               selectFromTree(currentlySelectedSource.target, true);
                                                           }}>{currentlySelectedSource.targetTitle}</Button>
                                </Text>
                            }
                            <div className='fw-bold'>Node type:</div>
                            <div> {sourceTreeSelectionTitle}</div>
                        </div>

                        {/*  ACTIONS */}
                        <div className='col-2'>
                            <div className='fw-bold'>Actions:</div>
                            {<IconButton onClick={() => addOrRemoveJoint(!isBothSelectedLinked)} aria-label="unlink"
                                         color="primary" size="large"
                                         disabled={isAnySelectedLinked && !isBothSelectedLinked || !(currentlySelectedSource.source.length > 0 && currentlySelectedTarget.source.length > 0)}>
                                {isBothSelectedLinked ? <LinkOffIcon/> : <AddLinkIcon/>}
                            </IconButton>}
                        </div>

                        {/* TARGET NODE */}
                        <div className='col-5 flex-column d-flex'>
                            <div className='fw-bold'>Target node:</div>
                            <div>{currentlySelectedTarget.sourceTitle}</div>
                            {currentlySelectedTarget.target &&
                                <Text>is linked to <Button className='px-0' style={{textTransform: 'none'}}
                                                           onClick={() => {
                                                               selectFromTree(currentlySelectedTarget.target, false);
                                                           }}>{currentlySelectedTarget.targetTitle}</Button>
                                </Text>
                            }
                            <div className='fw-bold'>Node type:</div>
                            <div> {targetTreeSelectionTitle}</div>

                        </div>
                    </div>

                    <h5 className='mt-3'>Node selection</h5>
                    <div className='row'>
                        <div className='col-6 bg-white px-0 mr-1'>
                            <div className="d-flex justify-content-end">
                                <Button className="mx-4" onClick={() => {
                                    handleExpandClick(true);
                                }}>
                                    {sourceTreeExpanded.length === 0 ? 'Expand tree' : 'Collapse tree'}
                                </Button>

                            </div>
                            <Box sx={{height: 500, flexGrow: 1, maxWidth: 700, overflowY: 'auto'}}>

                                <TreeView
                                    aria-label="controlled"
                                    expanded={sourceTreeExpanded}
                                    selected={sourceTreeSelectedArray}
                                    onNodeToggle={handleSourceToggle}
                                    onNodeSelect={handleSourceSelect}
                                    defaultCollapseIcon={<ExpandMoreIcon/>}
                                    defaultExpandIcon={<ChevronRightIcon/>}
                                >
                                    {fromTree(sourceData[0])}
                                </TreeView>
                            </Box>
                        </div>

                        <div className='col-6 bg-white px-0'>
                            <div className="d-flex justify-content-end">
                                <Button className="mx-4" onClick={() => {
                                    handleExpandClick(false);
                                }}>
                                    {targetTreeExpanded.length === 0 ? 'Expand tree' : 'Collapse tree'}
                                </Button>

                            </div>
                            <Box sx={{height: 500, flexGrow: 1, maxWidth: 700, overflowY: 'auto'}}>
                                <TreeView
                                    aria-label="controlled"
                                    expanded={targetTreeExpanded}
                                    selected={targetTreeSelectedArray}
                                    onNodeToggle={handleTargetToggle}
                                    onNodeSelect={handleTargetSelect}
                                    defaultCollapseIcon={<ExpandMoreIcon/>}
                                    defaultExpandIcon={<ChevronRightIcon/>}
                                >
                                    {toTree(targetData[0])}
                                </TreeView>
                            </Box>
                        </div>
                    </div>
                </div>

                {/*  RIGHT COLUMN */}
                <div className='col-4'>
                    <h5>Linked nodes</h5>
                    <LinkedNodesTable></LinkedNodesTable>
                </div>
            </div>
            <hr></hr>
        </>
    );
}
