import * as React from 'react';
import {useEffect} from 'react';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableCell from '@mui/material/TableCell';
import {Button as Sbutton, SearchInput} from 'suomifi-ui-components';
import Tooltip from '@mui/material/Tooltip';

import {NodeMapping} from '@app/common/interfaces/crosswalk-connection.interface';
import {InfoIcon} from '@app/common/components/shared-icons';
import {useTranslation} from 'next-i18next';
import {
  AccordionContainer,
  EmptyBlock,
  HorizontalLineMidEnd,
  HorizontalLineMidStart,
  HorizontalLineStart,
  HorizontalLineStartSecond,
  HorizontalLineTarget,
  HorizontalLineTargetEnd,
  HorizontalLineTargetStart,
  IconSpacer,
  SearchWrapper,
  StyledArrowRightIcon,
  StyledButton,
  StyledTableActionsCell,
  StyledTableButtonCell,
  StyledTableCell,
  StyledTableRow,
  StyledTableTargetCell,
  TableCellPadder,
  VerticalLine
} from '@app/modules/crosswalk-editor/mappings-accordion/mappings-accordion.styles';
import FunctionTooltipBox from "@app/modules/crosswalk-editor/mappings-accordion/function-tooltip-box";
import ConfirmModal from "@app/common/components/confirmation-modal";
import {Format} from "@app/common/interfaces/format.interface";
import {SchemaWithContent} from "@app/common/interfaces/schema.interface";

export interface highlightOperation {
  operationId: string;
  nodeId?: any;
}

function Row(props: {
  row: NodeMapping;
  viewOnlyMode: boolean;
  isEditModeActive: boolean;
  callBackFunction: any;
  showAttributeNames: boolean;
  rowcount: number;
  mappingFunctions: any;
  schemaFormats: {sourceSchemaFormat: Format | undefined, targetSchemaFormat: Format | undefined};
  schemaDatas: {sourceSchemaData: SchemaWithContent | undefined, targetSchemaData: SchemaWithContent | undefined};
}) {
  const { t } = useTranslation('common');
  const [open, setOpen] = React.useState(false);

  const [isDeleteMappingConfirmModalOpen, setIsDeleteMappingConfirmModalOpen] =
    React.useState<boolean>(false);

  function selectFromTrees(row: any, mappingId: any, isSourceTree: boolean) {
    props.callBackFunction.performAccordionAction(
      row,
      'selectFromTreesByMapping',
      mappingId,
      '',
      isSourceTree
    );
  };

  function performDeleteMappingAction() {
    setIsDeleteMappingConfirmModalOpen(false);
    props.callBackFunction.performAccordionAction(
      props.row,
      'removeMapping'
    );
  }

  return (
    <>
      <StyledTableRow className="accordion-row row">
        <StyledTableCell className="col-4">

          {props.row.source.map((mapping, index) => {
              return (<>
                <div className='d-flex justify-content-between'>
                  <div className='d-flex justify-content-center'>
                    <TableCellPadder>
                      <StyledButton
                        className="px-3 py-0"
                        style={{textTransform: 'none'}}
                        title={props.showAttributeNames ? t('mappings-accordion.select-linked-nodes') : returnFullPath(mapping.id)}
                        onClick={(e) => {
                          selectFromTrees(props.row, mapping.id, true);
                          e.stopPropagation();
                        }}
                      >{props.showAttributeNames ? mapping.label : returnPath(mapping.id, mapping.label,
                        props.schemaFormats?.sourceSchemaFormat, props.schemaDatas?.sourceSchemaData)}</StyledButton>

                      <HorizontalLineStart>
                        <div></div>
                      </HorizontalLineStart>
                    </TableCellPadder>
                  </div>
                  <StyledArrowRightIcon></StyledArrowRightIcon>
                  <HorizontalLineStart>
                    <div></div>
                  </HorizontalLineStart>
                  {mapping['processing']?.id &&
                      <FunctionTooltipBox callBackFunction={props.callBackFunction}
                                          isEditModeActive={props.isEditModeActive}
                                          tooltipHeading={'source operation'} tooltipHoverText={'source operation'}
                                          processingId={mapping.id} functionName={'sourceOperation'}
                                          mappingFunctions={props.mappingFunctions}
                                          row={props.row}></FunctionTooltipBox>
                  }
                  <HorizontalLineStartSecond>
                    <div></div>
                  </HorizontalLineStartSecond>
                  <div className='d-flex flex-column'>
                    {index === 0 && props.row.source.length > 1 && <EmptyBlock></EmptyBlock>}
                    {props.row.source.length > 1 && <VerticalLine>
                        <div></div>
                    </VerticalLine>}
                    {index === props.row.source.length - 1 && props.row.source.length > 1 && <EmptyBlock></EmptyBlock>}
                  </div>
                </div>
              </>)
            }
          )}

        </StyledTableCell>

        <StyledTableCell className='col-2'>
          <div className='d-flex justify-content-center'>
            <HorizontalLineMidStart>
              <div></div>
            </HorizontalLineMidStart>
            {props.row.processing &&
                <FunctionTooltipBox callBackFunction={props.callBackFunction} isEditModeActive={props.isEditModeActive}
                                    tooltipHeading={'mapping function'} tooltipHoverText={'mapping function'}
                                    processingId={props.row.processing.id} functionName={'mappingFunction'}
                                    mappingFunctions={props.mappingFunctions} row={props.row}></FunctionTooltipBox>
            }
            {!props.row.processing &&
                <IconSpacer></IconSpacer>
            }
            {props.row.predicate &&
                <FunctionTooltipBox alternateIconLetter={'P'} callBackFunction={props.callBackFunction}
                                    isEditModeActive={props.isEditModeActive} tooltipHeading={'predicate'}
                                    processingId={''} tooltipHoverText={'predicate'} functionName={'predicate'}
                                    mappingFunctions={props.mappingFunctions} row={props.row}></FunctionTooltipBox>
            }
            {!props.row.predicate &&
                <IconSpacer></IconSpacer>
            }
            <HorizontalLineMidEnd>
              <div></div>
            </HorizontalLineMidEnd>
          </div>
        </StyledTableCell>

        <StyledTableCell className="col-4">
          <div className='d-flex flex-column'>
            {props.row.target.map((mapping, index) => {
                return (<>
                  <div className='d-flex justify-content-between'>
                    <div className='d-flex justify-content-center'>
                      <div className='d-flex flex-column'>
                        {index === 0 && props.row.target.length > 1 && <EmptyBlock></EmptyBlock>}
                        {props.row.target.length > 1 && <VerticalLine>
                            <div></div>
                        </VerticalLine>}
                        {index === props.row.target.length - 1 && props.row.target.length > 1 &&
                            <EmptyBlock></EmptyBlock>}
                      </div>
                      {mapping['processing']?.id &&
                          <><HorizontalLineTargetStart>
                              <div></div>
                          </HorizontalLineTargetStart><FunctionTooltipBox callBackFunction={props.callBackFunction}
                                                                          isEditModeActive={props.isEditModeActive}
                                                                          tooltipHeading={'target operation'}
                                                                          tooltipHoverText={'target operation'}
                                                                          processingId={mapping.id}
                                                                          functionName={'targetOperation'}
                                                                          mappingFunctions={props.mappingFunctions}
                                                                          row={props.row}></FunctionTooltipBox><HorizontalLineTargetEnd>
                              <div></div>
                          </HorizontalLineTargetEnd></>
                      }{!mapping['processing']?.id && <HorizontalLineTarget><div></div></HorizontalLineTarget>}
                      <StyledArrowRightIcon></StyledArrowRightIcon>
                      <StyledButton
                        className="px-3 py-0"
                        style={{textTransform: 'none'}}
                        title={props.showAttributeNames ? t('mappings-accordion.select-linked-nodes') : returnFullPath(mapping.id)}
                        onClick={(e) => {
                          selectFromTrees(props.row, mapping.id, false);
                          e.stopPropagation();
                        }}
                      >{props.showAttributeNames ? mapping.label : returnPath(mapping.id, mapping.label,
                        props.schemaFormats?.targetSchemaFormat, props.schemaDatas?.targetSchemaData)}</StyledButton>
                    </div>
                  </div>
                </>)
              }
            )}
          </div>

        </StyledTableCell>

        <StyledTableButtonCell className="col-2 fw-bold">
          <>
            <div className='d-flex flex-row flex-wrap align-content-center'>
              <>
                <Tooltip
                  title={props.isEditModeActive ? 'Edit mapping' : 'Activate edit mode to edit mapping'}
                  placement="bottom"
                >
                  <Sbutton
                    disabled={!(props.isEditModeActive)}
                    onClick={(e) => {
                      props.callBackFunction.performAccordionAction(
                        props.row,
                        'openMappingDetails'
                      );
                    }}
                  >
                    Edit
                  </Sbutton>
                </Tooltip>
                <Tooltip
                  title={props.isEditModeActive ? t('actionmenu.delete-mapping') : t('actionmenu.activate-edit-mode-to-delete-mapping')}
                  placement="bottom"
                >
                  <Sbutton
                    disabled={!(props.isEditModeActive)}
                    className="ms-2"
                    onClick={(e) => {
                      setIsDeleteMappingConfirmModalOpen(true);
                    }}
                  >
                    Delete
                  </Sbutton>
                </Tooltip>
                {isDeleteMappingConfirmModalOpen && <ConfirmModal
                  heading={t('confirm-modal.heading')}
                  actionText={t('confirm')}
                  cancelText={t('cancel')}
                  confirmAction={performDeleteMappingAction}
                  onClose={() => {
                    setIsDeleteMappingConfirmModalOpen(false);
                  }}
                  text1={t('confirm-modal.do-you-want-to-delete-mapping')}
                />}
              </>
              {/*              <Tooltip
                title={open ? 'Hide details' : 'Show details'}
                placement="bottom"
              >
                <IconButton
                  className="ms-2"
                  hidden={props.viewOnlyMode}
                  aria-label="expand row"
                  size="small"
                  onClick={(e) => {
                    setOpen(!open);
                    e.stopPropagation();
                  }}
                >
                  {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                </IconButton>
              </Tooltip>*/}
            </div>
          </>
        </StyledTableButtonCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell className="accordion-fold-content">
          <Collapse
            in={open && !props.viewOnlyMode}
            timeout="auto"
            unmountOnExit
          >
            <div className="row row ms-2 mt-2 mb-3">
              <div className='row col-12'>
                <div className="col-5 gx-0">
                  {/*                                <Box sx={{margin: 1}}>
                                    <div className='fw-bold mt-3 mb-2' style={{fontSize: '0.9em'}}>Mapping type: <span
                                        className='fw-normal'>exact match</span></div>
                                    <br/>
                                </Box>*/}
                  <div className="ms-0 mt-1 mb-2">
                    <div>Mapping type:</div>
                    <div className="fw-normal mt-2">{props.row.predicate}</div>
                  </div>
                  <br/>
                </div>
                <div className="col-5 mt-1 mx-3">
                  {props.row.notes &&
                      <>
                          <div>Notes:</div>
                          <div className="fw-normal mt-2">{props.row.notes}</div>
                      </>
                  }
                </div>
                <div className='col mt-4 d-flex flex-row gx-0 justify-content-end'>
                  <div className="d-flex flex-column action-buttons">

                  </div>
                </div>
              </div>
            </div>
          </Collapse>
        </TableCell>
      </StyledTableRow>
    </>
  );
}

function extractPath(strings: string[]): string {
  let returnString = "";
  for (let i = 0; i < strings.length; i++) {
    if (strings.length === i - 1) {
      returnString = returnString + "/" + strings[i];
    } else {
      let separator = "/";
      if (i === 0) {
        separator = ""
      }
      if (i === strings.length - 2 || i === strings.length - 3 && strings.length > 3) {
        separator = "/ ";
      }
      if (i % 2 === 0) {
        returnString = returnString + separator + strings[i];
      }
    }
  }
  return returnString;
}

function returnFullPath(id: string) : string {
  let returnString = id.substring(id?.indexOf("#root-Root-") + "#root-Root-".length);
  let strings;
  if (returnString) {
    strings = returnString.split("-");
    returnString = "";
    if (strings.length > 1) {
      returnString = extractPath(strings);
    } else {
      returnString = strings[0];
    }
  }
  return returnString;
}

function returnPath(id: string, label: string, schemaFormat: Format | undefined, schemaData: SchemaWithContent | undefined) : string {
  let returnString = '';
  if (schemaFormat === Format.Xsd || schemaFormat === Format.Csv || schemaFormat === Format.Jsonschema || schemaFormat === Format.Skosrdf
  || schemaFormat === Format.Enum || schemaFormat === Format.Mscr) {
    returnString = id.substring(id?.indexOf("#root-Root-") + "#root-Root-".length);
    let strings;
    if (returnString) {
      strings = returnString.split("-");
      returnString = "";
      if (strings.length > 7) {
        returnString = strings[0] + "/{" + (strings.length - 5) / 2 + "}/" + strings[strings.length - 2] + "/ " + strings[strings.length - 1];
      } else if (strings.length > 1) {
        returnString = extractPath(strings);
      } else {
        returnString = strings[0];
      }
    }
    return returnString;
  } else {
    let className = '';
    if (schemaFormat === Format.Rdfs || schemaFormat === Format.Owl) {
      if (id.lastIndexOf('#') === -1) {
        returnString = id.substring(id.lastIndexOf('/') + 1);
      } else {
        className = id.substring(id?.lastIndexOf('/') + 1, label.lastIndexOf('#')) + ':';
        let itemName = id.substring(id.lastIndexOf('#') + 1);
        returnString = className + itemName;
      }
    } else if (schemaFormat === Format.Shacl) {
      let definitions = schemaData?.content?.definitions;
      if (definitions) {
        let keys = Object.keys(definitions);
        if (keys && keys.length > 0) {
          for (let i = 0; i < keys.length; i++) {
            let value = definitions[keys[i]];
            let secondLevelKeys = Object.keys(value);
            for (let k = 0; k < secondLevelKeys.length; k += 1) {
              if (secondLevelKeys[k] === 'properties') {
                let secondLevelValue = value[secondLevelKeys[k]];
                let thirdLevelKeys = Object.keys(secondLevelValue);
                for (let j = 0; j < thirdLevelKeys.length; j += 1) {
                  if (thirdLevelKeys[j] === id) {
                    for (let l = 0; l < secondLevelKeys.length; l += 1) {
                      if (secondLevelKeys[l] === 'title') {
                        let titleValue = value[secondLevelKeys[l]];
                        returnString = titleValue + ':' + label;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return returnString;
  }
}
function filterMappings(nodeMappingsInput: NodeMapping[], value: string, showAttributeNames: boolean) {
  let results: NodeMapping[] = [];
  const searchString = value.toLowerCase();
  nodeMappingsInput.forEach(item => {
      if (item?.notes && item.notes.toLowerCase().includes(searchString)) {
        results.push(item);
      }
      item.source.forEach(src => {
        if (src.label.toLowerCase().includes(searchString)) {
          results.push(item);
        }
      });
      item.target.forEach(src => {
        if (src.label.toLowerCase().includes(searchString)) {
          results.push(item);
        }
      });
    }
  );
  return results;
}

export default function MappingsAccordion(props: any) {
  const {t} = useTranslation('common');
  const [mappingData, setMappingData] = React.useState<NodeMapping[]>([]);
  const [showAttributeNames, setShowAttributeNames] = React.useState<boolean>(false);
  const [schemaFormats, setSchemaFormats] = React.useState<{}>({sourceSchemaFormat: undefined, targetSchemaFormat: undefined});
  const [schemaDatas, setSchemaDatas] = React.useState<{}>({sourceSchemaData: undefined, targetSchemaData: undefined});
  useEffect(() => {
    setMappingData(props.nodeMappings);
    setShowAttributeNames(props.showAttributeNames);
    setSchemaFormats(props.schemaFormats);
    setSchemaDatas(props.schemaDatas);
  }, [props]);
  const nodeMappingsInput = props.nodeMappings;
  return (
    <>

  <div className='d-flex justify-content-between ps-1'>
        <h2 className="mb-0">Mappings</h2>
        <SearchWrapper>
          <SearchInput
            labelText={''}
            labelMode='hidden'
            searchButtonLabel={t('mappings-accordion.filter-from-mappings')}
            clearButtonLabel={t('mappings-accordion.clear')}
            visualPlaceholder={t('mappings-accordion.filter-from-mappings')}
            onSearch={(value) => {
              if (typeof value === 'string') {
                setMappingData(filterMappings(nodeMappingsInput, value, showAttributeNames));
              }
            }}
            onChange={(value) => {
              if (!value) {
                setMappingData(props.nodeMappings);
              }
            }}
          />
        </SearchWrapper>
      </div>
      <AccordionContainer component={Paper} className="gx-0">
        <Table aria-label="collapsible table w-100">
          <TableHead>
            <TableRow className="accordion-row row">
              <StyledTableCell className="col-4">
                <TableCellPadder>
                  <span className="fw-bold ps-3">Source</span>
                </TableCellPadder>
              </StyledTableCell>
              <StyledTableCell className="col-2">
                <TableCellPadder>
                  <span className="fw-bold">Mapping operations</span>
                </TableCellPadder>
              </StyledTableCell>
              <StyledTableTargetCell className="col-4">
                <span className="fw-bold">Target</span>
              </StyledTableTargetCell>
              <StyledTableActionsCell className="col-2 d-flex flex-row justify-content-end">
                <TableCellPadder>
                  <span className="fw-bold">Actions</span>
                </TableCellPadder>
              </StyledTableActionsCell>
            </TableRow>
          </TableHead>

          {mappingData?.length > 0 && (
            <TableBody>
              {mappingData.map((row: NodeMapping) => {
                return (
                  <Row
                    key={row.pid}
                    row={row}
                    viewOnlyMode={props.viewOnlyMode}
                    isEditModeActive={props.isEditModeActive}
                    callBackFunction={props}
                    showAttributeNames={showAttributeNames}
                    rowcount={mappingData.length}
                    mappingFunctions={props.mappingFunctions}
                    schemaFormats={schemaFormats}
                    schemaDatas={schemaDatas}
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
      </AccordionContainer>
    </>
  );
}
