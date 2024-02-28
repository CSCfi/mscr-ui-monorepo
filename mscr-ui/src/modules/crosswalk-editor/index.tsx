import * as React from 'react';
import Box from '@mui/material/Box';
import TreeItem from '@mui/lab/TreeItem';
import { useEffect } from 'react';
import {
  Notification,
  Button as Sbutton,
  ActionMenuItem,
  ActionMenu,
} from 'suomifi-ui-components';
import { cloneDeep } from 'lodash';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import JointListingAccordion from '@app/modules/crosswalk-editor/joint-listing-accordion';
import MetadataAndFiles from '@app/modules/crosswalk-editor/tabs/metadata-and-files';
import { generateTreeFromJson } from '../crosswalk-editor/schema-mockup';

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
import { useGetFrontendSchemaQuery } from '@app/common/components/schema/schema.slice';
import { useGetCrosswalkMappingFunctionsQuery } from '@app/common/components/crosswalk-functions/crosswalk-functions.slice';
import { createTheme, ThemeProvider } from '@mui/material';
import HasPermission from '@app/common/utils/has-permission';
import VersionHistory from '@app/common/components/version-history';
import SchemaInfo from '@app/modules/crosswalk-editor/tabs/edit-crosswalk/schema-info';

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

  const emptyTreeSelection: RenderTree = {
    elementPath: '',
    parentElementPath: undefined,
    name: '',
    id: '',
    visualTreeId: '',
    properties: undefined,
    children: [],
  };

  const crosswalkConnectionNewInit: CrosswalkConnectionNew = {
    source: emptyTreeSelection,
    target: emptyTreeSelection,
    id: '0',
    description: '',
    isSelected: false,
    isDraft: false,
    sourceJsonPath: undefined,
    targetJsonPath: undefined,
    sourcePredicate: undefined,
    sourceProcessing: undefined,
    targetPredicate: undefined,
    targetProcessing: undefined,
  };

  // STATE VARIABLES
  const inputData: RenderTree[] = [];
  const [isSourceDataFetched, setSourceDataFetched] =
    React.useState<boolean>(false);
  const [isTargetDataFetched, setTargetDataFetched] =
    React.useState<boolean>(false);

  const [sourceSchemaUrn, setSourceSchemaUrn] = React.useState<string>('');
  const [targetSchemaUrn, setTargetSchemaUrn] = React.useState<string>('');

  const [sourceTreeDataOriginal, setSourceTreeDataOriginal] =
    React.useState<RenderTree[]>(inputData);
  const [sourceTreeData, setSourceTreeData] =
    React.useState<RenderTree[]>(inputData);

  const [targetTreeDataOriginal, setTargetTreeDataOriginal] =
    React.useState<RenderTree[]>(inputData);
  const [targetTreeData, setTargetTreeData] =
    React.useState<RenderTree[]>(inputData);

  const [selectedSourceNodes, setSelectedSourceNodes] = React.useState<
    RenderTree[]
  >([emptyTreeSelection]);
  const [selectedTargetNodes, setSelectedTargetNodes] = React.useState<
    RenderTree[]
  >([emptyTreeSelection]);

  const [connectedCrosswalksNew, setConnectedCrosswalksNew] = React.useState<
    CrosswalkConnectionNew[]
  >([]);
  const [nodeMappings, setNodeMappings] = React.useState<NodeMapping[]>([]);

  const [jointToBeEdited, setJointToBeEdited] = React.useState<
    CrosswalkConnectionNew | undefined
  >(undefined);

  const [linkingError, setLinkingError] = React.useState<string>('');
  const [selectedTab, setSelectedTab] = React.useState(1);
  const [isNodeMappingsModalOpen, setNodeMappingsModalOpen] =
    React.useState<boolean>(false);

  const [isEditModeActive, setEditModeActive] = React.useState<boolean>(false);
  const [isJointPatchOperation, setJointPatchOperation] =
    React.useState<boolean>(true);

  const [crosswalkPublished, setCrosswalkPublished] =
    React.useState<boolean>(true);
  const [publishNotificationVisible, setPublishNotificationVisible] =
    React.useState<boolean>(false);
  const [saveNotificationVisible, setSaveNotificationVisible] =
    React.useState<boolean>(false);
  const [lastPatchCrosswalkId, setLastPatchCrosswalkId] =
    React.useState<string>('');
  const [lastPutMappingPid, setLastPutMappingPid] = React.useState<string>('');
  const [lastPatchMappingPid, setLastPatchMappingPid] =
    React.useState<string>('');
  const [lastDeleteMappingPid, setLastDeleteMappingPid] =
    React.useState<string>('');

  const [patchCrosswalk, crosswalkPatchResponse] = usePatchCrosswalkMutation();
  const [putMapping, putMappingResponse] = usePutMappingMutation();
  const [deleteMapping, deleteMappingResponse] = useDeleteMappingMutation();
  const [patchMapping, patchMappingResponse] = usePatchMappingMutation();

  const [isAdmin, setIsAdmin] = React.useState<boolean>(
    HasPermission({ actions: ['CREATE_CROSSWALK'] }),
  );

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

  if (crosswalkPatchResponse.isSuccess) {
    if (
      !crosswalkPublished &&
      crosswalkPatchResponse?.originalArgs?.payload?.state === 'PUBLISHED'
    ) {
      setCrosswalkPublished(true);
      setPublishNotificationVisible(true);
      setEditModeActive(false);
      setLastPatchCrosswalkId(crosswalkPatchResponse.requestId);
      refetchCrosswalkData();
      setSelectedTab(0);
    } else if (
      !saveNotificationVisible &&
      lastPatchCrosswalkId !== crosswalkPatchResponse.requestId
    ) {
      // Operation is regular patch without publishing (save)
      setLastPatchCrosswalkId(crosswalkPatchResponse.requestId);
      refetchCrosswalkData();
      setSaveNotificationVisible(true);
    }
  }

  useEffect(() => {
    // Reset initial state when tab changed.
    if (selectedTab === 1) {
      setEditModeActive(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    // After joint is created, this opens editing modal
    setNodeMappingsModalOpen(true);
  }, [jointToBeEdited]);

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
    data: getSourceSchemaData,
    isLoading: getSourceSchemaDataIsLoading,
    isSuccess: getSourceSchemaDataIsSuccess,
    isError: getSourceSchemaDataIsError,
    error: getSourceSchemaDataError,
  } = useGetFrontendSchemaQuery(sourceSchemaUrn);

  const {
    data: getTargetSchemaData,
    isLoading: getTargetSchemaDataIsLoading,
    isSuccess: getTargetSchemaDataIsSuccess,
    isError: getTargetSchemaDataIsError,
    error: getTargetSchemaDataError,
  } = useGetFrontendSchemaQuery(targetSchemaUrn);

  const {
    data: mappingsFromBackend,
    isLoading: getMappingsDataIsLoading,
    isSuccess: getMappingsDataIsSuccess,
    isError: getMappingsIsError,
    error: getMappingsError,
  } = useGetMappingsQuery(crosswalkId[0]);

  useEffect(() => {
    if (getSourceSchemaData?.content) {
      generateTreeFromJson(getSourceSchemaData).then((res) => {
        if (res) {
          setSourceTreeDataOriginal(cloneDeep(res));
          setSourceTreeData(res);
          setSourceDataFetched(true);
          //refetchOriginalSourceSchemaData();
        }
      });
    }
  }, [getSourceSchemaDataIsSuccess, getSourceSchemaData]);

  useEffect(() => {
    if (getTargetSchemaData?.content) {
      generateTreeFromJson(getTargetSchemaData).then((res) => {
        if (res) {
          setTargetTreeDataOriginal(cloneDeep(res));
          setTargetTreeData(res);
          setTargetDataFetched(true);
        }
      });
    }
  }, [getTargetSchemaDataIsSuccess, getTargetSchemaData]);

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
    //TODO: add success and error notification?
    // if (lastPatchMappingPid !== patchMappingResponse.data.pid) {
    // }
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
    if (jointToBeEdited) {
      jointToBeEdited.id = response.data.pid;

      if (isPutOperation) {
        const newMapping = response.data as NodeMapping;
        setNodeMappings((mappings) => {
          return [newMapping, ...mappings];
        });

        setLastPutMappingPid(response.data.pid);
        setConnectedCrosswalksNew((crosswalkMappings) => {
          return [jointToBeEdited, ...crosswalkMappings];
        });
      } else {
        // This is needed in the future for showing success or error status
        setLastPatchMappingPid(response.data.pid);
      }
    }
  }

  function publishCrosswalk() {
    const publishPayload = {
      state: 'PUBLISHED',
    };
    patchCrosswalk({ payload: publishPayload, pid: crosswalkId[0] });
  }

  function addOrEditJointButtonClick(
    add: boolean,
    mappingToBeEdited: NodeMapping | undefined,
  ) {
    if (add) {
      const jointsToBeAdded: CrosswalkConnectionNew[] = [];
      selectedSourceNodes.forEach((sourceNode) => {
        const joint: CrosswalkConnectionNew = {
          source: sourceNode,
          target: selectedTargetNodes[0],
          id: '',
          description: '',
          isSelected: true,
          isDraft: true,
          sourceJsonPath: undefined,
          targetJsonPath: undefined,
          sourcePredicate: undefined,
          sourceProcessing: undefined,
          targetPredicate: undefined,
          targetProcessing: undefined,
        };
        jointsToBeAdded.push(joint);
      });
      //setConnectedCrosswalksNew(crosswalkMappings => [...jointsToBeAdded, ...crosswalkMappings]);
      setJointPatchOperation(false);
      setJointToBeEdited(jointsToBeAdded[jointsToBeAdded.length - 1]);
    } else {
      const sourceNodeIds: string[] = [];
      if (mappingToBeEdited) {
        mappingToBeEdited.source.forEach((item) => {
          sourceNodeIds.push(item.id);
        });
      }

      const targetNodeIds: string[] = [];
      if (mappingToBeEdited) {
        mappingToBeEdited.target.forEach((item) => {
          targetNodeIds.push(item.id);
        });
      }

      const sourceNodes = getTreeNodesByIds(sourceNodeIds, true);
      const targetNodes = getTreeNodesByIds(targetNodeIds, false);

      const jointsToBeEdited: CrosswalkConnectionNew[] = [];
      sourceNodes.forEach((sourceNode) => {
        const joint: CrosswalkConnectionNew = {
          source: sourceNode,
          target: targetNodes[0],
          id: mappingToBeEdited?.pid ? mappingToBeEdited.pid : '',
          description: '',
          isSelected: true,
          isDraft: true,
          sourceJsonPath: undefined,
          targetJsonPath: undefined,
          sourcePredicate: undefined,
          sourceProcessing: undefined,
          targetPredicate: undefined,
          targetProcessing: undefined,
        };
        jointsToBeEdited.push(joint);
      });
      setJointPatchOperation(true);
      setJointToBeEdited(jointsToBeEdited[jointsToBeEdited.length - 1]);
    }
  }

  function removeJoint(jointPid: any) {
    deleteMapping(jointPid);
  }

  // Used to generate data for mappings modal
  function getTreeNodesByIds(nodeIds: string[], isSourceTree: boolean) {
    if (isSourceTree) {
      const foundSourceNodes: RenderTree[] = [];
      return findNodesFromTree(
        sourceTreeDataOriginal,
        nodeIds,
        foundSourceNodes,
      );
    } else {
      const foundTargetNodes: RenderTree[] = [];
      return findNodesFromTree(
        targetTreeDataOriginal,
        nodeIds,
        foundTargetNodes,
      );
    }
  }

  // Used to tree filtering
  function findNodesFromTree(
    tree: any,
    itemsToFind: string[],
    results: RenderTree[],
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
    node: NodeMapping,
    isSourceTree: boolean,
  ) => {
    const nodeIds: string[] = [];

    if (isSourceTree) {
      node.source.forEach((node) => nodeIds.push(node.id));
      setSourceTreeSelection(nodeIds);
    } else {
      node.target.forEach((node) => nodeIds.push(node.id));
      setTargetTreeSelection(nodeIds);
    }
  };

  const performCallbackFromAccordionAction = (
    joint: NodeMapping,
    action: string,
    value: string,
  ) => {
    if (action === 'remove') {
      removeJoint(joint);
    } else if (action === 'addNotes') {
      // TODO: implement add notes from accordion if needed?
      //joint.notes = value;
      //updateJointData(joint);
    } else if (action === 'selectFromSourceTree') {
      selectFromTreeByNodeMapping(joint, true);
      scrollToTop();
    } else if (action === 'selectFromTargetTree') {
      selectFromTreeByNodeMapping(joint, false);
      scrollToTop();
    } else if (action === 'openJointDetails') {
      addOrEditJointButtonClick(false, joint);
    } else if (action === 'removeJoint') {
      removeJoint(joint.pid);
    }
  };

  const performCallbackFromSchemaInfo = (
    nodeIds: any,
    isSourceTree: boolean,
  ) => {
    if (isSourceTree) {
      setSelectedSourceNodes(nodeIds);
    } else {
      setSelectedTargetNodes(nodeIds);
    }
  };

  const performCallbackFromMappingsModal = (
    action: any,
    mappingPayload: any,
    patchPid: string,
  ) => {
    if (action === 'closeModal') {
      setNodeMappingsModalOpen(false);
    }
    if (action === 'addJoint') {
      setNodeMappingsModalOpen(false);
      putMapping({ payload: mappingPayload, pid: crosswalkId[0] });
      const sourceIds: string[] = [];
      const targetIds: string[] = [];
      mappingPayload.source.forEach((node: { id: string }) =>
        sourceIds.push(node.id),
      );
      setSourceTreeSelection(sourceIds);
      mappingPayload.target.forEach((node: { id: string }) =>
        targetIds.push(node.id),
      );
      setTargetTreeSelection(targetIds);
    }
    if (action === 'save') {
      setNodeMappingsModalOpen(false);
      patchMapping({ payload: mappingPayload, pid: patchPid });
    }
  };

  const performMetadataAndFilesAction = (properties: any, action: string) => {
    if (action === 'saveChanges') {
      const obj = Object.assign({}, ...properties);
      setEditModeActive(false);
      patchCrosswalk({ payload: obj, pid: crosswalkId[0] });
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
    newValue: number,
  ) => {
    setSelectedTab(newValue);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <>
        {getCrosswalkDataIsSuccess && (
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

            {selectedTab === 0 &&
              isSourceDataFetched &&
              isTargetDataFetched &&
              getCrosswalkData && (
              <>
                <MetadataAndFiles
                  crosswalkData={getCrosswalkData}
                  sourceSchemaData={getSourceSchemaData}
                  targetSchemaData={getTargetSchemaData}
                  performMetadataAndFilesAction={
                    performMetadataAndFilesAction
                  }
                  nodeMappings={nodeMappings}
                  crosswalkId={crosswalkId}
                  isAdmin={isAdmin}
                />
              </>
            )}
            {/*            <CustomTabPanel value={selectedTab} index={0}>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={1}>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={2}>
            </CustomTabPanel>*/}
            <div className="row d-flex justify-content-between mt-2 crosswalk-editor">
              {crosswalkPublished && publishNotificationVisible && (
                <Notification
                  closeText="Close"
                  headingText="Crosswalk published successfully"
                  smallScreen
                  onCloseButtonClick={() =>
                    setPublishNotificationVisible(false)
                  }
                ></Notification>
              )}
              {saveNotificationVisible && (
                <Notification
                  closeText="Close"
                  headingText="Crosswalk saved successfully"
                  smallScreen
                  onCloseButtonClick={() => setSaveNotificationVisible(false)}
                ></Notification>
              )}
              <div className={selectedTab === 1 ? 'col-10' : 'd-none'}></div>
              <div
                className={
                  selectedTab === 1
                    ? 'col-2 d-flex justify-content-end flex-row pe-4 pb-2'
                    : 'd-none'
                }
              >
                {isAdmin && (
                  <ActionMenu className="mb-2" buttonText="Actions">
                    <ActionMenuItem
                      onClick={() => setEditModeActive(true)}
                      className={isEditModeActive ? 'd-none' : ''}
                    >
                      Edit
                    </ActionMenuItem>
                    <ActionMenuItem
                      onClick={() => setEditModeActive(false)}
                      className={isEditModeActive ? '' : 'd-none'}
                    >
                      Finish editing
                    </ActionMenuItem>
                  </ActionMenu>
                )}
              </div>

              {/*  LEFT COLUMN */}
              <div className={selectedTab === 1 ? 'col-12' : 'd-none'}>
                {isSourceDataFetched && isTargetDataFetched && (
                  <>
                    <div className="row gx-0"></div>
                    <div className="row gx-0">
                      {/*  SOURCE TREE */}
                      <div className="col-5 ps-4">
                        <SchemaInfo
                          treeDataInput={sourceTreeData}
                          updateTreeNodeSelectionsOutput={
                            performCallbackFromSchemaInfo
                          }
                          isSourceTree={true}
                          treeSelection={sourceTreeSelection}
                          caption={'Filter from source schema'}
                        ></SchemaInfo>
                      </div>

                      {/*  MID BUTTONS */}
                      <div className="col-2 px-4 mid-buttons">
                        {isAdmin && (
                          <Sbutton
                            className="link-button"
                            title={
                              linkingError.length > 1
                                ? linkingError
                                : 'Link selected nodes'
                            }
                            disabled={
                              selectedSourceNodes.length < 1 ||
                              selectedTargetNodes.length < 1 ||
                              crosswalkPublished ||
                              !isEditModeActive
                            }
                            onClick={() => {
                              addOrEditJointButtonClick(
                                true,
                                undefined,
                              );
                            }}
                          >
                            <LinkIcon></LinkIcon>
                          </Sbutton>
                        )}
                      </div>

                      {/*  TARGET TREE */}
                      <div className="col-5 pe-4">
                        <SchemaInfo
                          treeDataInput={targetTreeData}
                          updateTreeNodeSelectionsOutput={
                            performCallbackFromSchemaInfo
                          }
                          isSourceTree={false}
                          treeSelection={targetTreeSelection}
                          caption={'Filter from target schema'}
                        ></SchemaInfo>
                      </div>
                    </div>
                  </>
                )}
                {jointToBeEdited && (
                  <>
                    <NodeMappingsModal
                      selectedCrosswalk={jointToBeEdited}
                      performMappingsModalAction={
                        performCallbackFromMappingsModal
                      }
                      mappingFilters={mappingFilters}
                      mappingFunctions={mappingFunctions}
                      modalOpen={isNodeMappingsModalOpen}
                      isJointPatchOperation={isJointPatchOperation}
                    ></NodeMappingsModal>
                  </>
                )}
              </div>
              {/*  BOTTOM COLUMN */}
              {selectedTab === 1 && (
                <>
                  <div className="col-12 px-4 mt-4">
                    <h2>Mappings</h2>
                    <div className="joint-listing-accordion-wrap my-3">
                      <Box
                        className="mb-4"
                        sx={{ height: 640, flexGrow: 1, overflowY: 'auto' }}
                      >
                        <JointListingAccordion
                          nodeMappings={nodeMappings}
                          viewOnlyMode={false}
                          isEditModeActive={
                            isEditModeActive && !crosswalkPublished
                          }
                          performAccordionAction={
                            performCallbackFromAccordionAction
                          }
                        ></JointListingAccordion>
                      </Box>
                    </div>
                  </div>
                </>
              )}
              {selectedTab === 2 && (
                <VersionHistory revisions={getCrosswalkData.revisions} />
              )}
            </div>
          </>
        )}
      </>
    </ThemeProvider>
  );
}
