import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {useBreakpoints} from "../../../../../../common-ui/components/media-query";
import {styled} from "@mui/material";
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddLinkIcon from '@mui/icons-material/AddLink';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import {Button as Sbutton, Textarea, TextInput} from "suomifi-ui-components";
import Button from '@mui/material/Button';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckIcon from '@mui/icons-material/Check';
import EditRoundedIcon from '@mui/icons-material/EditRounded';


import {
    CrosswalkConnection,
    CrosswalkConnectionNew,
    RenderTree
} from "@app/common/interfaces/crosswalk-connection.interface";

const crosswalkConnectionInit = {
    source: '',
    target: '',
    sourceTitle: '',
    targetTitle: '',
    type: '',
    notes: '',
    title: '',
};

const StyledTableCell = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
    [`&.${tableCellClasses.body}`]: {
        padding: '0px',
    },
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
        //backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function Row(props: { row: CrosswalkConnectionNew, cbf: any }) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    const [changedNotes, setChangedNotes] = React.useState<string>('');
    const addNotes = 'addNotes';


    return (
        <React.Fragment>
            <StyledTableRow className='accordion-row'>
                <StyledTableCell className='col-1'>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={(e) => {props.cbf.performAccordionAction(row, 'openJointDetails')}}
                    >
                        {row.isSelected ? <EditRoundedIcon className='selection-active'/> : <EditRoundedIcon/>}
                    </IconButton>
                </StyledTableCell>
                <StyledTableCell className='col-2'>
                    <Button className='ms-2 py-0' style={{textTransform: 'none'}} title='Select linked node from source tree'
                            onClick={(e) => {
                                props.cbf.performAccordionAction(row, 'selectFromSourceTree'); e.stopPropagation();
                            }}>{row.source.name}</Button>
                </StyledTableCell>

{/*                <StyledTableCell className='fw-bold' style={{width: '10%'}}>
                    <IconButton onClick={(e) => {props.cbf.performAccordionAction(row, 'remove'); e.stopPropagation();}} aria-label="unlink" color="primary" title='Unlink nodes'
                                size="large">
                    <LinkOffIcon/>
                    </IconButton>
                </StyledTableCell>*/}

                <StyledTableCell className='col-2'>
                    <Button className='me-2 py-0' style={{textTransform: 'none'}} title='Select linked node from target tree'
                            onClick={(e) => {
                                props.cbf.performAccordionAction(row, 'selectFromTargetTree'); e.stopPropagation();
                            }}>{row.target.name}</Button>
                </StyledTableCell>
                <StyledTableCell className='col-2 fw-bold' style={{width: '10%'}}>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={(e) => {setOpen(!open); e.stopPropagation();}}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </StyledTableCell>

            </StyledTableRow>

            <StyledTableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <div className='fw-bold mt-3 mb-2' style={{fontSize: '0.9em'}}>Mapping type: <span className='fw-normal'>exact match</span></div>
                            <Textarea
                                onChange={(event) => setChangedNotes(event.target.value)}
                                onBlur={() => props.cbf.performAccordionAction(row, addNotes, changedNotes)}
                                labelText="Notes:"
                                visualPlaceholder="No notes set. Add free form notes here."
                                value={changedNotes}
                            />
                            <br/>
                        </Box>
                    </Collapse>
                </TableCell>
            </StyledTableRow>
        </React.Fragment>
    );
}

let rows = [{...crosswalkConnectionInit}];

function createCrosswalkAccorionData(crosswalkInput: any) {
    rows = [{...crosswalkInput}];
}

export default function JointListingAccordion(props: any) {
    if (props.crosswalkJoints.length > 0) {
        createCrosswalkAccorionData(props.crosswalkJoints);
        // return LinkedNodesTable(props.crosswalkJoints);
    }

    const crosswalkJointsInput = props.crosswalkJoints;

    return (<>
    <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
            <TableHead>
                <TableRow className='accordion-row row'>
                    <StyledTableCell className='col-1'></StyledTableCell>
                    <StyledTableCell className='col-2'>Source node</StyledTableCell>
                    <StyledTableCell className='col-2'>Target node</StyledTableCell>
                    <StyledTableCell className='col-1'></StyledTableCell>
                    <StyledTableCell className='col-6'/>
                </TableRow>
            </TableHead>
            <TableBody onClick={(e) => {
            }}>
                {crosswalkJointsInput.map((row: CrosswalkConnectionNew) => {
                    return(<Row key={row.id} row={row} cbf={props} />)
                })}
            </TableBody>
        </Table>
    </TableContainer>
        </>
    );
}
