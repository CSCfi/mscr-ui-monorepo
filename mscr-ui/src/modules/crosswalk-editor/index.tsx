import * as React from 'react';
import Box from '@mui/material/Box';
import TreeItem from '@mui/lab/TreeItem';
import { useEffect } from 'react';
import {
  Button,
  Notification,
  Button as Sbutton,
  Text,
} from 'suomifi-ui-components';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import MappingsAccordion from '@app/modules/crosswalk-editor/mappings-accordion';
import MetadataAndFiles from '@app/modules/crosswalk-editor/tabs/metadata-and-files';

import {
  CrosswalkConnectionNew,
  RenderTree,
  NodeMapping,
} from '@app/common/interfaces/crosswalk-connection.interface';
import NodeMappingsModal from './tabs/node-mappings';
import LinkIcon from '@app/common/components/shared-icons';
import {
  usePatchCrosswalkMutation,
  usePutMappingMutation,
  useDeleteMappingMutation,
  usePatchMappingMutation,
  useGetMappingsQuery,
  useGetCrosswalkWithRevisionsQuery,
} from '@app/common/components/crosswalk/crosswalk.slice';
import { useGetCrosswalkMappingFunctionsQuery } from '@app/common/components/crosswalk-functions/crosswalk-functions.slice';
import { createTheme, Grid, ThemeProvider } from '@mui/material';
import HasPermission from '@app/common/utils/has-permission';
import VersionHistory from '@app/common/components/version-history';
import SchemaInfo from '@app/common/components/schema-info';
import { useTranslation } from 'next-i18next';
import { State } from '@app/common/interfaces/state.interface';
import MetadataStub from '@app/modules/form/metadata-form/metadata-stub';
import { ActionMenuTypes, Type } from '@app/common/interfaces/search.interface';
import SchemaAndCrosswalkActionMenu from '@app/common/components/schema-and-crosswalk-actionmenu';
import {
  ActionMenuWrapper,
  TestButton,
} from '@app/modules/crosswalk-editor/crosswalk-editor.styles';
import { setNotification } from '@app/common/components/notifications/notifications.slice';
import { useStoreDispatch } from '@app/store';
import OperationalizeModal from '../operationalize-modal';
import {asArray} from "@app/common/utils/hooks/use-url-state";
import Tooltip from '@mui/material/Tooltip';

export default function CrosswalkEditor({
  crosswalkId,
}: {
  crosswalkId: string;
}) {
  const theme = createTheme({
    typography: {
      fontFamily: [
        'Source Sans Pro',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
      ].join(','),
    },
  });

  const { t } = useTranslation('common');
  const dispatch = useStoreDispatch();

  const emptyTreeSelection: RenderTree = {
    elementPath: '',
    parentElementPath: undefined,
    name: '',
    id: '',
    visualTreeId: '',
    properties: undefined,
    uri: '',
    children: [],
    qname: '',
  };

  // STATE VARIABLES
  const [sourceSchemaUrn, setSourceSchemaUrn] = React.useState<string>('');
  const [targetSchemaUrn, setTargetSchemaUrn] = React.useState<string>('');

  const [selectedSourceNodes, setSelectedSourceNodes] = React.useState<
    RenderTree[]
  >([]);
  const [selectedTargetNodes, setSelectedTargetNodes] = React.useState<
    RenderTree[]
  >([]);
  const [patchSourceNodes, setPatchSourceNodes] = React.useState<RenderTree[]>([
    emptyTreeSelection,
  ]);
  const [patchTargetNodes, setPatchTargetNodes] = React.useState<RenderTree[]>([
    emptyTreeSelection,
  ]);
  const [patchPid, setPatchPid] = React.useState<string>('');

  const [nodeMappings, setNodeMappings] = React.useState<NodeMapping[]>([]);

  const [mappingToBeEdited, setMappingToBeEdited] = React.useState<
    CrosswalkConnectionNew[] | undefined
  >(undefined);

  const [linkingError, setLinkingError] = React.useState<string>('');
  const [selectedTab, setSelectedTab] = React.useState(1);
  const [isNodeMappingsModalOpen, setNodeMappingsModalOpen] =
    React.useState<boolean>(false);

  const [isEditModeActive, setEditModeActive] = React.useState<boolean>(false);
  const [isPatchMappingOperation, setIsMappingPatchOperation] =
    React.useState<boolean>(false);
  const [isOneToManyMapping, setIsOneToManyMapping] =
    React.useState<boolean>(false);

  const [crosswalkPublished, setCrosswalkPublished] =
    React.useState<boolean>(true);
  const [lastPatchCrosswalkId, setLastPatchCrosswalkId] =
    React.useState<string>('');
  const [lastPutMappingPid, setLastPutMappingPid] = React.useState<string>('');
  const [lastPatchMappingReqId, setLastPatchMappingReqId] =
    React.useState<string>('');
  const [lastDeleteMappingPid, setLastDeleteMappingPid] =
    React.useState<string>('');
  const [showAttributeNames, setShowAttributeNames] = React.useState(true);

  const [putMapping, putMappingResponse] = usePutMappingMutation();
  const [deleteMapping, deleteMappingResponse] = useDeleteMappingMutation();
  const [patchMapping, patchMappingResponse] = usePatchMappingMutation();

  const [sourceTreeSelection, setSourceTreeSelection] = React.useState<
    string[]
  >([]);

  const [targetTreeSelection, setTargetTreeSelection] = React.useState<
    string[]
  >([]);

  const { data: mappingFunctions, isLoading: mappingFunctionsIsLoading } =
    useGetCrosswalkMappingFunctionsQuery('');

  const { data: mappingFilters, isLoading: mappingFiltersIsLoading } =
    useGetCrosswalkMappingFunctionsQuery('FILTERS');

  const {
    data: getCrosswalkData,
    isLoading: getCrosswalkDataIsLoading,
    isSuccess: getCrosswalkDataIsSuccess,
    isError: getCrosswalkDataIsError,
    error: getCrosswalkDataError,
    refetch: refetchCrosswalkData,
  } = useGetCrosswalkWithRevisionsQuery(crosswalkId);

  const hasEditRights = HasPermission({
    action: 'EDIT_CONTENT',
    owner: getCrosswalkData?.owner,
  });

  const fromTree = (nodes: any) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      label={nodes.name}
      className="linked-tree-item"
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node: any) => fromTree(node))
        : null}
    </TreeItem>
  );

  useEffect(() => {
    // Reset initial state when tab changed.
    if (selectedTab === 1) {
      setEditModeActive(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    if (
      patchSourceNodes &&
      patchTargetNodes &&
      patchSourceNodes[0].id.length > 0 &&
      patchTargetNodes[0].id.length > 0
    ) {
      // Source and target nodes are both now fetched from trees
      setMappingToBeEdited(
        generateMappingToBeEdited(patchSourceNodes, patchTargetNodes, patchPid)
      );
    }
  }, [patchSourceNodes, patchTargetNodes]);

  useEffect(() => {
    // After mapping to be edited is set, this opens editing modal
    setNodeMappingsModalOpen(true);
  }, [mappingToBeEdited]);

  useEffect(() => {
    if (getCrosswalkData?.sourceSchema) {
      setSourceSchemaUrn(getCrosswalkData.sourceSchema);
    }
    if (getCrosswalkData?.targetSchema) {
      setTargetSchemaUrn(getCrosswalkData.targetSchema);
    }
    if (getCrosswalkData && getCrosswalkData?.state !== 'PUBLISHED') {
      setCrosswalkPublished(false);
    }
  }, [getCrosswalkData]);

  const {
    data: mappingsFromBackend,
    isLoading: getMappingsDataIsLoading,
    isSuccess: getMappingsDataIsSuccess,
    isError: getMappingsIsError,
    error: getMappingsError,
    refetch: refetchMappings,
  } = useGetMappingsQuery(crosswalkId);

  useEffect(() => {
    if (mappingsFromBackend) {
      const nodeMappings = mappingsFromBackend as NodeMapping[];
      setNodeMappings(nodeMappings);
    }
  }, [getMappingsDataIsSuccess]);

  // Add mapping to accordion
  if (putMappingResponse.isSuccess) {
    if (lastPutMappingPid !== putMappingResponse.data.pid) {
      addMappingToAccordion(putMappingResponse, true);
    }
    //TODO: add error notification
  }

  if (patchMappingResponse.isSuccess) {
    if (lastPatchMappingReqId !== patchMappingResponse.requestId) {
      addMappingToAccordion(patchMappingResponse, false);
    }
  }

  if (deleteMappingResponse.isSuccess) {
    if (
      deleteMappingResponse.isSuccess &&
      deleteMappingResponse.originalArgs !== lastDeleteMappingPid
    ) {
      const newMappings = [
        ...nodeMappings.filter((item) => {
          return item.pid !== deleteMappingResponse.originalArgs;
        }),
      ];
      if (deleteMappingResponse.originalArgs) {
        setLastDeleteMappingPid(deleteMappingResponse.originalArgs);
      }
      setNodeMappings(() => [...newMappings]);
      //
    }
  }

  function addMappingToAccordion(response: any, isPutOperation: boolean) {
    if (mappingToBeEdited) {
      mappingToBeEdited[0].id = response.data.pid;

      if (isPutOperation) {
        const newMapping = response.data as NodeMapping;
        setNodeMappings((mappings) => {
          return [newMapping, ...mappings];
        });
        setLastPutMappingPid(response.data.pid);
      } else {
        // This is needed in the future for showing success or error status
        setLastPatchMappingReqId(response.requestId);
        const patchedMapping = patchMappingResponse.data as NodeMapping;

        const filteredMappings = [
          ...nodeMappings.filter((item) => {
            return item.pid !== patchMappingResponse?.originalArgs?.pid;
          }),
        ];
        setNodeMappings((mappings) => {
          return [patchedMapping, ...filteredMappings];
        });
      }
    }
  }

  function addMappingButtonClick() {
    setIsMappingPatchOperation(false);
    const mappingssToBeAdded: CrosswalkConnectionNew[] = [];
    const isManyToOneMapping = selectedSourceNodes.length > 1;

    if (isManyToOneMapping) {
      selectedSourceNodes.forEach((sourceNode) => {
        const mapping: CrosswalkConnectionNew = {
          source: sourceNode,
          target: selectedTargetNodes[0],
          id: '',
          isSelected: true,
          isDraft: true,
          sourceJsonPath: undefined,
          targetJsonPath: undefined,
          sourcePredicate: undefined,
          sourceProcessing: undefined,
          targetPredicate: undefined,
          targetProcessing: undefined,
          notes: undefined,
          predicate: '',
          processing: '',
        };
        mappingssToBeAdded.push(mapping);
      });
    }

    // Only one to many or many to one mappings are available
    if (!isManyToOneMapping) {
      selectedTargetNodes.forEach((targetNode) => {
        const mapping: CrosswalkConnectionNew = {
          source: selectedSourceNodes[0],
          target: targetNode,
          id: '',
          isSelected: true,
          isDraft: true,
          sourceJsonPath: undefined,
          targetJsonPath: undefined,
          sourcePredicate: undefined,
          sourceProcessing: undefined,
          targetPredicate: undefined,
          targetProcessing: undefined,
          notes: undefined,
          predicate: '',
          processing: '',
        };
        mappingssToBeAdded.push(mapping);
      });
    }
    setIsOneToManyMapping(!isManyToOneMapping);
    setMappingToBeEdited(mappingssToBeAdded);
  }

  function generateMappingToBeEdited(
    sourceNodes: RenderTree[],
    targetNodes: RenderTree[],
    patchPid: string
  ) {
    const originalMapping: NodeMapping[] = nodeMappings.filter(
      (item) => item.pid === patchPid
    );

    const mappingsToBeAdded: CrosswalkConnectionNew[] = [];
    const isOneToManyMapping = sourceNodes.length < 2;
    setIsOneToManyMapping(isOneToManyMapping);

    if (isOneToManyMapping) {
      for (let i = 0; i < targetNodes.length; i +=1) {
        const mapping: CrosswalkConnectionNew = {
          processing: undefined,
          source: sourceNodes[0],
          target: targetNodes[i],
          id: patchPid,
          notes: originalMapping.length > 0 ? originalMapping[0].notes : '',
          predicate:
            originalMapping.length > 0 ? originalMapping[0].predicate : '',
          isSelected: true,
          isDraft: true,
          sourceJsonPath: undefined,
          targetJsonPath: undefined,
          sourcePredicate: undefined,
          sourceProcessing: originalMapping.length > 0 ? originalMapping[0].source[i]?.processing : undefined,
          targetPredicate: undefined,
          targetProcessing: undefined
        };
        mappingsToBeAdded.push(mapping);
      };
    }
    else {
      for (let i = 0; i < sourceNodes.length; i +=1) {
        const mapping: CrosswalkConnectionNew = {
          processing: undefined,
          source: sourceNodes[i],
          target: targetNodes[0],
          id: patchPid,
          notes: originalMapping.length > 0 ? originalMapping[0].notes : '',
          predicate:
            originalMapping.length > 0 ? originalMapping[0].predicate : '',
          isSelected: true,
          isDraft: true,
          sourceJsonPath: undefined,
          targetJsonPath: undefined,
          sourcePredicate: undefined,
          sourceProcessing: originalMapping.length > 0 ? originalMapping[0].source[i]?.processing : undefined,
          targetPredicate: undefined,
          targetProcessing: undefined
        };
        mappingsToBeAdded.push(mapping);
      };
    }
    return mappingsToBeAdded;
  }

  function removeMapping(mappingPid: any) {
    deleteMapping(mappingPid);
  }

  // Used to tree filtering
  function findNodesFromTree(
    tree: any,
    itemsToFind: string[],
    results: RenderTree[]
  ) {
    tree.forEach((item: RenderTree) => {
      if (itemsToFind.includes(item.id)) {
        results.push(item);
      } else {
        if (item.children && item.children.length > 0) {
          return findNodesFromTree(item.children, itemsToFind, results);
        }
      }
    });
    return results;
  }

  // Called from accordion
  const selectFromTreeByNodeMapping = (
    node: NodeMapping | undefined,
    isSourceTree: boolean
  ) => {
    const nodeIds: string[] = [];
    if (node) {
      if (isSourceTree) {
        node.source.forEach((node) => nodeIds.push(node.id));
        setSourceTreeSelection(nodeIds);
      } else {
        node.target.forEach((node) => nodeIds.push(node.id));
        setTargetTreeSelection(nodeIds);
      }
    }
  };

  const performCallbackFromAccordionAction = (
    mapping: NodeMapping,
    action: string,
    nodeId?: string
  ) => {
    // TODO: implement add notes from accordion if needed?
    if (action === 'remove') {
      removeMapping(mapping);
    } else if (action === 'selectFromSourceTreeByMapping') {
      selectFromTreeByNodeMapping(mapping, true);
      scrollToTop();
    } else if (action === 'selectFromSourceTreeById') {
      if (nodeId) {
        setSourceTreeSelection([nodeId]);
      }
      scrollToTop();
    } else if (action === 'selectFromTargetTreeByMapping') {
      selectFromTreeByNodeMapping(mapping, false);
      scrollToTop();
    } else if (action === 'selectFromTargetTreeById') {
      if (nodeId) {
        setTargetTreeSelection([nodeId]);
      }
      scrollToTop();
    }
    else if (action === 'selectFromTargetTreeByMapping') {
      selectFromTreeByNodeMapping(mapping, false);
      scrollToTop();
    } else if (action === 'openMappingDetails') {
      setIsMappingPatchOperation(true);
      setPatchPid(mapping.pid ? mapping.pid : '');
      selectFromTreeByNodeMapping(mapping, true);
      selectFromTreeByNodeMapping(mapping, false);
    } else if (action === 'removeMapping') {
      removeMapping(mapping.pid);
    }
  };

  const performCallbackFromSchemaInfo = (
    nodeIds: RenderTree[],
    isSourceTree: boolean
  ) => {
    if (nodeIds.length > 0) {
      if (isSourceTree) {
        setSelectedSourceNodes(nodeIds);
        if (isPatchMappingOperation) {
          setPatchSourceNodes(nodeIds);
        }
      } else {
        setSelectedTargetNodes(nodeIds);
        if (isPatchMappingOperation) {
          setPatchTargetNodes(nodeIds);
        }
      }
    }
  };

  const performCallbackFromActionMenu = (action: any) => {
    if (action === 'disableEdit') {
      setEditModeActive(false);
    }
    if (action === 'edit') {
      if (isEditModeActive) {
        dispatch(setNotification('FINISH_EDITING_MAPPINGS'));
        setEditModeActive(false);
      } else {
        dispatch(setNotification('EDIT_MAPPINGS'));
        setEditModeActive(true);
      }
    }
  };

  const performCallbackFromMappingsModal = (
    action: any,
    mappingPayload: any,
    patchPid: string
  ) => {
    if (action === 'closeModal') {
      setIsMappingPatchOperation(false);
      setNodeMappingsModalOpen(false);
    }
    if (action === 'addMapping') {
      setNodeMappingsModalOpen(false);
      putMapping({ payload: mappingPayload, pid: crosswalkId });
      const sourceIds: string[] = [];
      const targetIds: string[] = [];
      mappingPayload.source.forEach((node: { id: string }) =>
        sourceIds.push(node.id)
      );
      setSourceTreeSelection(sourceIds);
      mappingPayload.target.forEach((node: { id: string }) =>
        targetIds.push(node.id)
      );
      setTargetTreeSelection(targetIds);
    }
    if (action === 'save') {
      setIsMappingPatchOperation(false);
      setNodeMappingsModalOpen(false);
      patchMapping({ payload: mappingPayload, pid: patchPid });
    }
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
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

  const changeTab = (
    event: React.SyntheticEvent | undefined,
    newValue: number
  ) => {
    setSelectedTab(newValue);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (getCrosswalkDataIsError) {
    // console.log('Error: ', getCrosswalkDataError);
  }

  if (getCrosswalkDataIsError) {
    if (
      'status' in getCrosswalkDataError &&
      getCrosswalkDataError.status === 404
    ) {
      return <Text>{t('error.not-found')}</Text>;
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <>
        {getCrosswalkDataIsSuccess &&
        getCrosswalkData.state !== State.Removed ? (
          <>
            <Box
              className="mb-3"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tabs
                value={selectedTab}
                onChange={changeTab}
                aria-label="Category selection"
              >
                <Tab label="Metadata & files" {...a11yProps(0)} />
                <Tab label="Crosswalk" {...a11yProps(1)} />
                <Tab label="Version history" {...a11yProps(2)} />
              </Tabs>
            </Box>

            {selectedTab === 0 && getCrosswalkData && (
              <>
                <MetadataAndFiles
                  crosswalkData={getCrosswalkData}
                  refetch={refetchCrosswalkData}
                />
              </>
            )}
            {/*            <CustomTabPanel value={selectedTab} index={0}>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={1}>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={2}>
            </CustomTabPanel>*/}
            <div className="row d-flex h-0">
              <div className={selectedTab === 1 ? 'col-10' : 'd-none'}></div>
              <div
                className={
                  selectedTab === 1
                    ? 'col-2 d-flex justify-content-end flex-row pe-3 pb-2'
                    : 'd-none'
                }
              >
                {hasEditRights && (
                  <>
                    <ActionMenuWrapper>
                      <SchemaAndCrosswalkActionMenu
                        buttonCallbackFunction={performCallbackFromActionMenu}
                        metadata={getCrosswalkData}
                        isMappingsEditModeActive={isEditModeActive}
                        refetchMetadata={refetchCrosswalkData}
                        type={ActionMenuTypes.CrosswalkEditor}
                      />
                    </ActionMenuWrapper>
                    {/*<TestButton>*/}
                    {/*    <OperationalizeModal*/}
                    {/*      sourceSchemaPid=""*/}
                    {/*      targetSchemaPid=""*/}
                    {/*      crosswalkPid=""*/}
                    {/*      ></OperationalizeModal>*/}
                    {/*</TestButton>*/}
                  </>
                )}
              </div>
            </div>
            <div className="row d-flex justify-content-between crosswalk-editor">
              {/*  LEFT COLUMN */}
              <div
                className={selectedTab === 1 ? 'col-12 mx-1 mt-3' : 'd-none'}
              >
                <>
                  <div className="row gx-0">
                    {/*  SOURCE TREE */}
                    <div className="col-5">
                      <SchemaInfo
                        updateTreeNodeSelectionsOutput={
                          performCallbackFromSchemaInfo
                        }
                        isSourceTree={true}
                        treeSelection={sourceTreeSelection}
                        caption={t(
                          'crosswalk-editor.search-from-source-schema'
                        )}
                        schemaUrn={sourceSchemaUrn}
                        raiseHeading={hasEditRights}
                      ></SchemaInfo>
                    </div>

                    {/*  MID BUTTONS */}
                    <div className="col-2 px-4 mid-buttons">
                      {hasEditRights && (
                        <Tooltip
                          title={selectedSourceNodes.length > 1 && selectedTargetNodes.length > 1 ? 'Many to many node mappings are not supported' : !isEditModeActive ? 'Activate edit mode to enable mappings' : 'Map selected nodes'}
                          placement="bottom"
                        >
                        <Sbutton
                          className="link-button"
                          disabled={
                            selectedSourceNodes.length < 1 ||
                            selectedTargetNodes.length < 1 ||
                            crosswalkPublished ||
                            (selectedSourceNodes.length > 1 && selectedTargetNodes.length > 1) ||
                            !isEditModeActive
                          }
                          onClick={() => {
                            addMappingButtonClick();
                          }}
                        >
                          <LinkIcon></LinkIcon>
                        </Sbutton>
                        </Tooltip>
                      )}
                    </div>

                    {/*  TARGET TREE */}
                    <div className="col-5 pe-2">
                      <SchemaInfo
                        updateTreeNodeSelectionsOutput={
                          performCallbackFromSchemaInfo
                        }
                        isSourceTree={false}
                        treeSelection={targetTreeSelection}
                        caption={t(
                          'crosswalk-editor.search-from-target-schema'
                        )}
                        schemaUrn={targetSchemaUrn}
                        raiseHeading={hasEditRights}
                      ></SchemaInfo>
                    </div>
                  </div>
                </>

                {mappingToBeEdited && (
                  <>
                    <NodeMappingsModal
                      nodeSelections={mappingToBeEdited}
                      performMappingsModalAction={
                        performCallbackFromMappingsModal
                      }
                      mappingFilters={mappingFilters}
                      mappingFunctions={mappingFunctions}
                      modalOpen={isNodeMappingsModalOpen}
                      isPatchMappingOperation={isPatchMappingOperation}
                      isOneToManyMapping={isOneToManyMapping}
                    ></NodeMappingsModal>
                  </>
                )}
              </div>
              {/*  BOTTOM COLUMN */}
              {selectedTab === 1 && (
                <>
                  <div className="col-12 mt-4">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h2 className="mb-0">Mappings</h2>
                      </div>

                      <div className="align-self-end pe-1">
                        {/*                        // TODO: this can be shown when attribute qnames are available for accordion. Those are temporarily replaced with attribute ids.
                        <Checkbox
                          checked={showAttributeNames}
                          onClick={(newState) => {
                            setShowAttributeNames(newState.checkboxState);
                          }}
                        >Show node titles
                        </Checkbox>*/}
                      </div>
                    </div>

                    <div className="mapping-listing-accordion-wrap my-3">
                      <Box
                        className="mb-4"
                        sx={{ height: 640, flexGrow: 1, overflowY: 'auto' }}
                      >
                        <MappingsAccordion
                          nodeMappings={nodeMappings}
                          viewOnlyMode={false}
                          isEditModeActive={
                            isEditModeActive && !crosswalkPublished
                          }
                          showAttributeNames={showAttributeNames}
                          performAccordionAction={
                            performCallbackFromAccordionAction
                          }
                        ></MappingsAccordion>
                      </Box>
                    </div>
                  </div>
                </>
              )}
              {selectedTab === 2 && (
                <>
                  <Grid container>
                    <Grid item xs={6}>
                      <h2 className="ms-2">{t('metadata.versions')}</h2>
                    </Grid>
                    <Grid item xs={6} className="d-flex justify-content-end">
                      <div className="mt-3 me-2">
                        {hasEditRights && (
                          <SchemaAndCrosswalkActionMenu
                            buttonCallbackFunction={
                              performCallbackFromActionMenu
                            }
                            metadata={getCrosswalkData}
                            isMappingsEditModeActive={isEditModeActive}
                            refetchMetadata={refetchCrosswalkData}
                            type={ActionMenuTypes.CrosswalkVersionInfo}
                          />
                        )}
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <VersionHistory
                        revisions={getCrosswalkData.revisions}
                        contentType={Type.Crosswalk}
                        currentRevision={crosswalkId}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </div>
          </>
        ) : (
          getCrosswalkDataIsSuccess && ( // Stub view if state is REMOVED
            <>
              <Box
                className="mb-3"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tabs value={0} aria-label={t('tabs.label')}>
                  <Tab label={t('tabs.metadata-stub')} {...a11yProps(0)} />
                </Tabs>
              </Box>

              {getCrosswalkData && (
                <MetadataStub
                  metadata={getCrosswalkData}
                  type={Type.Crosswalk}
                />
              )}
            </>
          )
        )}
      </>
    </ThemeProvider>
  );
}
