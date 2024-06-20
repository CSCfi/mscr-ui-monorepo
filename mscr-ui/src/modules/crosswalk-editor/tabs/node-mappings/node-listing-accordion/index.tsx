import * as React from 'react';
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
import {styled} from '@mui/material';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import {Button as Sbutton, Dropdown, DropdownItem, SearchInput, Textarea, TextInput} from 'suomifi-ui-components';
import Button from '@mui/material/Button';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckIcon from '@mui/icons-material/Check';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

import {
  CrosswalkConnectionNew,
  NodeListingRow,
  NodeMapping
} from '@app/common/interfaces/crosswalk-connection.interface';
import {InfoIcon} from '@app/common/components/shared-icons';
import {useEffect, useState} from 'react';
import {useTranslation} from 'next-i18next';
import {SearchWrapper} from "@app/modules/crosswalk-editor/mappings-accordion/mappings-accordion.styles";
import {
  Button as SButton,
} from 'suomifi-ui-components';


const StyledCollapse = styled(Collapse)({
  maxWidth: '277px'
});


const StyledTableCell = styled(TableCell)({
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  fontSize: '0.95rem'
});

const StyledTableHeadingCell = styled(TableCell)({
  display: 'flex',
  flexDirection: 'column',
  fontSize: '1rem'
});


const StyledTableButtonCell = styled(TableCell)({
  display: 'flex',
  justifyContent: 'end',
  flexDirection: 'row',
  div: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  button: {maxHeight: '36px'}
});

const StyledTableRow = styled(TableRow)(({theme}) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  maxWidth: '300px',
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledTableFoldRow = styled(TableRow)(({theme}) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  maxWidth: '308px',
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function Row(props: {
  row: NodeListingRow;
  mappingFunctions: any;
  showAttributeNames: boolean;
  sourceOperationValues: Array<any>;
  predicateOperationValues: [];
  index: number;
  callBackFunction: any;
  rowCount: number;
  isSourceAccordion: boolean;
}) {
  const [open, setOpen] = React.useState(props.rowCount < 2 && props.index === 0);

  function deleteNodeFromMapping() {
    props.callBackFunction('deleteSourceNode', props.row.id);
    setOpen(false);
  }

  return (
    <>
      <StyledTableRow className="row">
        <StyledTableCell className="col-9 px-4">
          <div className=''>{props.row.name}</div>
        </StyledTableCell>

        {/*                <StyledTableCell className='fw-bold' style={{width: '10%'}}>
                    <IconButton onClick={(e) => {props.cbf.performAccordionAction(row, 'remove'); e.stopPropagation();}} aria-label="unlink" color="primary" title='Unlink nodes'
                                size="large">
                    <LinkOffIcon/>
                    </IconButton>
                </StyledTableCell>*/}

        <StyledTableButtonCell className="col-3 fw-bold">
          <div>
                <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={(e) => {
                      setOpen(!open);
                      e.stopPropagation();
                    }}
                >
                  {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                </IconButton>
          </div>
        </StyledTableButtonCell>
      </StyledTableRow>

      <StyledTableFoldRow>
        <TableCell className="d-flex flex-nowrap p-0">
          <StyledCollapse
            in={open}
            timeout="auto"
            unmountOnExit
          >
            <div className="row">
                <div className="col-10">
                  <div className="mx-3 mt-1 mb-2 d-flex flex-column">
                      <p>
                        <span className="fw-bold">Type: </span>
                        {props?.row?.type ?? ''}
                      </p>
                      <p>
                        <span className="fw-bold">Description: </span>
                        {props?.row?.description?.length > 0 ? props?.row?.description : 'N/A'}
                      </p>

                    {props.isSourceAccordion &&
                        <><Dropdown className='mt-2 node-info-dropdown'
                                    labelText="Source operation"
                                    visualPlaceholder="Operation not selected"
                                    value={props.row?.sourceProcessingSelection}
                                    onChange={(newValue) => props.callBackFunction('updateSourceOperation', props.row.id, newValue, props.row.id)}
                        >
                          {props?.mappingFunctions?.map((rt) => (
                            <DropdownItem key={rt.uri} value={rt.uri}>
                              {rt.name}
                            </DropdownItem>
                          ))}
                        </Dropdown>
                            <div><TextInput
                                onChange={(newValue) => props.callBackFunction('updateSourceOperationValue', props.row.id, newValue)}
                                visualPlaceholder="Operation value"
                            /></div>

                            <Dropdown
                            className="mt-2 node-info-dropdown"
                            labelText="Predicate"
                            visualPlaceholder="Exact match"
                            onChange={(newValue) => props.callBackFunction('updateSourcePredicate', props.row.id, newValue)}
                        >
                          {props.predicateOperationValues.map((rt) => (
                            <DropdownItem key={rt.id} value={rt.name}>
                              {rt.name}
                            </DropdownItem>
                          ))}
                        </Dropdown><SButton className="align-self-end"
                                            style={{height: 'min-content'}}
                                            onClick={() => deleteNodeFromMapping()}
                                            variant="secondaryNoBorder"
                        >
                          {'Remove node'}
                        </SButton></>
                    }
                  </div>
                  <br/>
                </div>
                <div className='col-2 mt-4 d-flex flex-row gx-0 justify-content-end'>
                  <div className="d-flex flex-column action-buttons">
                  </div>
                </div>
            </div>
          </StyledCollapse>
        </TableCell>
      </StyledTableFoldRow>
    </>
  );
}


function filterMappings(nodeMappingsInput: NodeMapping[], value: string, showAttributeNames: boolean, mappingFunctions: any) {
  return nodeMappingsInput.filter(item => {
    const searchString = value.toLowerCase();
    return (item.source[0].label.toLowerCase().includes(searchString) || item.target[0].label.toLowerCase().includes(searchString) || (item?.notes && item.notes.toLowerCase().includes(searchString)));
  });
}

export default function NodeListingAccordion(props: any) {
  const {t} = useTranslation('common');
  const [nodeData, setNodeData] = React.useState<NodeListingRow[]>([]);
  const [showAttributeNames, setShowAttributeNames] = React.useState<boolean>(true);
  useEffect(() => {
    let newNodes: NodeListingRow[] = [];
    if (props.isSourceAccordion) {
      props.nodes.forEach((node: CrosswalkConnectionNew) => {
        let newNode: NodeListingRow = {
          description: node?.source.properties.description,
          sourceProcessingSelection: node?.sourceProcessing?.id ?? '',
          type: node?.source.properties.type,
          isSelected: false, notes: undefined, name: node.source.name, id: node.source.id}
        newNodes.push(newNode);
      });
    } else {
      const node = props.nodes[0];
      let newNode: NodeListingRow = {
        description: node?.target.properties.description,
        sourceProcessingSelection: node?.sourceProcessing?.id ?? '',
        type: node?.target.properties.type,
        isSelected: false, notes: undefined, name: node.target.name, id: node.target.id}
      newNodes.push(newNode);
    }
    setNodeData(newNodes);
    setShowAttributeNames(props.showAttributeNames);
  }, [props]);

  const nodeMappingsInput = props.nodeMappings;
  return (
    <>
      <TableContainer component={Paper} className="gx-0">
        <Table aria-label="collapsible table w-100">
          <TableHead className="gx-0">
            <TableRow className="row gx-0">
              <StyledTableHeadingCell className="col-12 bg-light-blue">
                <span className="fw-bold ps-3">{props.isSourceAccordion ? 'Sources' : 'Target'}</span>
              </StyledTableHeadingCell>
            </TableRow>
          </TableHead>

          {nodeData?.length > 0 && (
            <TableBody>
              {nodeData.map((row: NodeListingRow, index) => {
                return (
                  <Row
                    key={index}
                    index={index}
                    row={row}
                    callBackFunction={props.accordionCallbackFunction}
                    showAttributeNames={showAttributeNames}
                    mappingFunctions={props.mappingFunctions}
                    predicateOperationValues={props.predicateOperationValues}
                    sourceOperationValues={props.sourceOperationValues}
                    rowCount={nodeData.length}
                    isSourceAccordion={props.isSourceAccordion}
                  />
                );
              })}
            </TableBody>
          )}
          {nodeMappingsInput?.length < 1 && (
            <TableBody>
              <TableRow className="">
                <td>
                  <div className="empty-mappings-table">
                    <div className="info-icon">
                      <InfoIcon></InfoIcon>
                    </div>
                    <div>
                      No elements have been mapped yet. Mappings will appear in
                      this table.
                    </div>
                  </div>
                </td>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </>
  );
}
