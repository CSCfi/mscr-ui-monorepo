import { useTranslation } from 'next-i18next';
import { useStoreDispatch } from '@app/store';
import { createTheme, ThemeProvider } from '@mui/material';
import { useSelector } from 'react-redux';
import {
  selectModal,
  setConfirmModalState,
  setFormModalState
} from '@app/common/components/actionmenu/actionmenu.slice';
import {
  useDeleteCrosswalkMutation, useDeleteMappingMutation, useGetCrosswalkWithRevisionsQuery, useGetMappingsQuery,
  usePatchCrosswalkMutation, usePatchMappingMutation, usePutMappingMutation
} from '@app/common/components/crosswalk/crosswalk.slice';
import HasPermission from '@app/common/utils/has-permission';
import { useEffect, useState } from 'react';
import { updateActionMenu } from '@app/common/components/schema-and-crosswalk-actionmenu/update-action-menu';
import { Type } from '@app/common/interfaces/search.interface';
import { State } from '@app/common/interfaces/state.interface';
import {
  selectIsEditContentActive,
  setIsEditContentActive
} from '@app/common/components/content-view/content-view.slice';
import { NotificationKeys } from '@app/common/interfaces/notifications.interface';
import { mscrSearchApi } from '@app/common/components/mscr-search/mscr-search.slice';
import { setNotification } from '@app/common/components/notifications/notifications.slice';
import { Text } from 'suomifi-ui-components';
import CrosswalkTabmenu from 'src/common/components/crosswalk-tabmenu';
import MetadataStub from '@app/modules/form/metadata-form/metadata-stub';
import MetadataAndFiles from '@app/modules/crosswalk-editor/tabs/metadata-and-files';
import VersionHistory from '@app/common/components/version-history';
import ConfirmModal from '@app/common/components/confirmation-modal';
import FormModal, { ModalType } from '@app/modules/form';
import { Format } from '@app/common/interfaces/format.interface';
import CrosswalkEditor from '@app/modules/crosswalk-editor';
import SpinnerOverlay from '@app/common/components/spinner-overlay';
import { SpinnerWrapper } from '@app/modules/crosswalk-view/crosswalk-view.styles';
import MappingsAccordion, {
  highlightOperation,
} from "@app/modules/crosswalk-editor/mappings-accordion";
import {CrosswalkConnectionNew, NodeMapping, RenderTree} from "@app/common/interfaces/crosswalk-connection.interface";
import {
  useGetCrosswalkMappingFunctionsQuery
} from "@app/common/components/crosswalk-functions/crosswalk-functions.slice";
import {SchemaWithContent} from "@app/common/interfaces/schema.interface";
import {useGetFrontendSchemaQuery, useGetSchemaQuery} from "@app/common/components/schema/schema.slice";
import NodeMappingsModal from "@app/modules/crosswalk-editor/tabs/node-mappings";

export default function CrosswalkView({ crosswalkId }: { crosswalkId: string }) {
  const { t } = useTranslation('common');
  const dispatch = useStoreDispatch();
  const confirmModalIsOpen = useSelector(selectModal()).confirm;
  const formModalIsOpen = useSelector(selectModal()).form;
  const [loadingSpinnerVisible, setLoadingSpinnerVisible] = useState(false);
  const [nodeMappings, setNodeMappings] = useState<NodeMapping[]>([]);
  const isEditModeActive = useSelector(selectIsEditContentActive());
  const [showAttributeNames, setShowAttributeNames] = useState(false);
  const [sourceTreeSelection, setSourceTreeSelection] = useState<string[]>([]);
  const { data: mappingFunctions /*, isLoading: mappingFunctionsIsLoading*/ } =
    useGetCrosswalkMappingFunctionsQuery('');
  const [scrollToSelectedSourceNodeId, setScrollToSelectedSourceNodeId] = useState<
    string | undefined
  >('');
  const [scrollToSelectedTargetNodeId, setScrollToSelectedTargetNodeId] = useState<
    string | undefined
  >('');
  const [isPatchMappingOperation, setIsMappingPatchOperation] =
    useState<boolean>(false);
  const [patchPid, setPatchPid] = useState<string>('');
  const [highlightOperation, setHighlightOperation] = useState<
    highlightOperation | undefined
  >(undefined);
  const [isNodeMappingsModalOpen, setNodeMappingsModalOpen] =
    useState<boolean>(false);
  const [targetTreeSelection, setTargetTreeSelection] = useState<string[]>([]);
  const [isOneToManyMapping, setIsOneToManyMapping] = useState<boolean>(false);

  const emptyTreeSelection: RenderTree = {
    rootPathIds: [],
    name: '',
    id: '',
    visualTreeId: '',
    properties: undefined,
    uri: '',
    children: [],
    qname: '',
  };

  const [patchSourceNodes, setPatchSourceNodes] = useState<RenderTree[]>([
    emptyTreeSelection,
  ]);

  const [patchTargetNodes, setPatchTargetNodes] = useState<RenderTree[]>([
    emptyTreeSelection,
  ]);

  const [lastPutMappingPid, setLastPutMappingPid] = useState<string>('');
  const [lastPatchMappingReqId, setLastPatchMappingReqId] =
    useState<string>('');
  const [lastDeleteMappingPid, setLastDeleteMappingPid] = useState<string>('');

  const [deleteMapping, deleteMappingResponse] = useDeleteMappingMutation();
  const [patchCrosswalk] = usePatchCrosswalkMutation();
  const [deleteCrosswalk] = useDeleteCrosswalkMutation();

  const {
    data: crosswalkData,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
  } = useGetCrosswalkWithRevisionsQuery(crosswalkId);

  const hasEditPermission = HasPermission({
    action: 'EDIT_CONTENT',
    owner: crosswalkData?.owner,
  });

  const [mappingToBeEdited, setMappingToBeEdited] = useState<
    CrosswalkConnectionNew[] | undefined
  >(undefined);

  const [putMapping, putMappingResponse] = usePutMappingMutation();
  const [patchMapping, patchMappingResponse] = usePatchMappingMutation();

  const {
    data: mappingsFromBackend,
    // isLoading: getMappingsDataIsLoading,
    isSuccess: getMappingsDataIsSuccess,
    // isError: getMappingsIsError,
    // error: getMappingsError,
    // refetch: refetchMappings,
  } = useGetMappingsQuery(crosswalkId);

  const { data: mappingFilters /*, isLoading: mappingFiltersIsLoading*/ } =
    useGetCrosswalkMappingFunctionsQuery('FILTERS');

  let sourceSchemaFormat: Format | undefined, targetSchemaFormat: Format | undefined;
  let sourceSchemaData: SchemaWithContent | undefined, targetSchemaData: SchemaWithContent | undefined;

  const sourceSchema = getSchema(crosswalkData?.sourceSchema || '');
  const {data: getSchemaData1, isSuccess: getSchemaDataIsSuccess1} =
        useGetFrontendSchemaQuery(crosswalkData?.sourceSchema?? '');
  sourceSchemaFormat = sourceSchema?.format ?? undefined;
  sourceSchemaData = getSchemaData1 ?? undefined;
  const targetSchema = getSchema(crosswalkData?.targetSchema || '');

  const {data: getSchemaData2, isSuccess: getSchemaDataIsSuccess} =
        useGetFrontendSchemaQuery(crosswalkData?.targetSchema ?? '');
  targetSchemaFormat = targetSchema?.format ?? undefined;
  targetSchemaData = getSchemaData2 ?? undefined;

  useEffect(() => {
    updateActionMenu(dispatch, Type.Crosswalk, crosswalkData, hasEditPermission);
  }, [dispatch, crosswalkData, hasEditPermission]);

  useEffect(() => {
    // After mapping to be edited is set, this opens editing modal
    setNodeMappingsModalOpen(true);
  }, [mappingToBeEdited]);

  useEffect(() => {
    if (mappingsFromBackend) {
      const nodeMappings = mappingsFromBackend as NodeMapping[];
      setNodeMappings(nodeMappings);
    }
  }, [getMappingsDataIsSuccess, mappingsFromBackend]);

  useEffect(() => {
    if (
      patchSourceNodes &&
      patchTargetNodes &&
      patchSourceNodes[0]?.id?.length > 0 &&
      patchTargetNodes[0]?.id?.length > 0
    ) {
      // Source and target nodes are both now fetched from trees
      setMappingToBeEdited(
        generateMappingToBeEdited(patchSourceNodes, patchTargetNodes, patchPid)
      );
    }
  }, [patchSourceNodes, patchTargetNodes]);
  interface StatePayload {
    versionLabel?: string;
    state?: State;
  }
  const payloadBase: StatePayload = {
    versionLabel: crosswalkData?.versionLabel,
  };

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


  const publishCrosswalk = () => {
    const publishPayload = {...payloadBase, state: State.Published};
    dispatch(setIsEditContentActive(false));
    changeCrosswalkState(publishPayload, 'CROSSWALK_PUBLISH');
  };

  const deprecateCrosswalk = () => {
    const deprecatePayload = {...payloadBase, state: State.Deprecated};
    changeCrosswalkState(deprecatePayload, 'CROSSWALK_DEPRECATE');
  };

  const invalidateCrosswalk = () => {
    const invalidatePayload = {...payloadBase, state: State.Invalid};
    changeCrosswalkState(invalidatePayload, 'CROSSWALK_INVALIDATE');
  };

  const removeCrosswalk = () => {
    const removePayload = {...payloadBase, state: State.Removed};
    changeCrosswalkState(removePayload, 'CROSSWALK_DELETE');
  };

  const changeCrosswalkState = (payload: StatePayload, notificationKey: NotificationKeys) => {
    if (!crosswalkData) return;
    patchCrosswalk({ payload: payload, pid: crosswalkData.pid })
      .unwrap()
      .then(() => {
        dispatch(
          mscrSearchApi.util.invalidateTags([
            'PersonalContent',
            'OrgContent',
            'MscrSearch',
          ])
        );
        dispatch(setNotification(notificationKey));
      });
  };

  const deleteCrosswalkDraft = () => {
    if (!crosswalkData) return;
    deleteCrosswalk(crosswalkData.pid)
      .unwrap()
      .then(() => {
        dispatch(
          mscrSearchApi.util.invalidateTags([
            'MscrSearch',
            'OrgContent',
            'PersonalContent',
          ])
        );
        dispatch(setNotification('CROSSWALK_DELETE'));
      });
    // ToDo: handle an exception
  };

  const performCallbackFromAccordionAction = (
    mapping: NodeMapping,
    action: string,
    nodeId?: string,
    mappingOrHighlightOperationId?: string,
    isSourceTree?: boolean
  ) => {
    setScrollToSelectedSourceNodeId('');
    setScrollToSelectedTargetNodeId('');
    // TODO: implement add notes from accordion if needed?
    if (action === 'remove') {
      removeMapping(mapping);
    } else if (action === 'selectFromTreesByMapping') {
      if (isSourceTree === true) {
        setScrollToSelectedSourceNodeId(nodeId);
        setScrollToSelectedTargetNodeId(mapping.target[0].id);
      } else {
        setScrollToSelectedTargetNodeId(nodeId);
        setScrollToSelectedSourceNodeId(mapping.source[0].id);
      }
      selectFromTreeByNodeMapping(mapping, true);
      selectFromTreeByNodeMapping(mapping, false);
    } else if (action === 'openMappingDetails') {
      handleScrolling(mapping, nodeId);
      setIsMappingPatchOperation(true);
      setPatchPid(mapping.pid ? mapping.pid : '');
      selectFromTreeByNodeMapping(mapping, true);
      selectFromTreeByNodeMapping(mapping, false);
    } else if (action === 'highlightFunctionField') {
      handleScrolling(mapping, nodeId);
      setHighlightOperation({
        operationId: mappingOrHighlightOperationId
          ? mappingOrHighlightOperationId
          : '',
        nodeId: nodeId,
      });
      setIsMappingPatchOperation(true);
      setPatchPid(mapping.pid ? mapping.pid : '');
      selectFromTreeByNodeMapping(mapping, true);
      selectFromTreeByNodeMapping(mapping, false);
    } else if (action === 'removeMapping') {
      handleScrolling(mapping, nodeId);
      removeMapping(mapping.pid);
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
      for (let i = 0; i < targetNodes.length; i += 1) {
        const mapping: CrosswalkConnectionNew = {
          processing: originalMapping[0].processing,
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
          sourceProcessing:
            originalMapping.length > 0
              ? originalMapping[0].source[i]?.processing
              : undefined,
          targetPredicate: undefined,
          targetProcessing:
            originalMapping.length > 0
              ? originalMapping[0].target[i]?.processing
              : undefined,
        };
        mappingsToBeAdded.push(mapping);
      }
    } else {
      for (let i = 0; i < sourceNodes.length; i += 1) {
        const mapping: CrosswalkConnectionNew = {
          processing: originalMapping[0].processing,
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
          sourceProcessing:
            originalMapping.length > 0
              ? originalMapping[0].source[i]?.processing
              : undefined,
          targetPredicate: undefined,
          targetProcessing:
            originalMapping.length > 0
              ? originalMapping[0].target[i]?.processing
              : undefined,
        };
        mappingsToBeAdded.push(mapping);
      }
    }
    return mappingsToBeAdded;
  }

  function handleScrolling(mapping: NodeMapping, nodeId? : string) {
    if (nodeId === undefined) {
      setScrollToSelectedSourceNodeId(nodeId);
      setScrollToSelectedTargetNodeId(nodeId);
    } else {
      if (nodeId === mapping.source[0].id) {
        setScrollToSelectedSourceNodeId(nodeId);
        setScrollToSelectedTargetNodeId(mapping.target[0].id);
      } else {
        setScrollToSelectedTargetNodeId(nodeId);
        setScrollToSelectedSourceNodeId(mapping.source[0].id);
      }
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

  function getSchema(schemaPid: string) {
    const {data: schemaData} = useGetSchemaQuery(
      schemaPid ?? '',
    );
    return schemaData;
  }

  // Called from mappings list
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

  function removeMapping(mappingPid: any) {
    deleteMapping(mappingPid);
  }

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

  if (isLoading) {
    setTimeout(() => setLoadingSpinnerVisible(true), 500);
    return (
      <SpinnerWrapper>
        <SpinnerOverlay animationVisible={loadingSpinnerVisible} transparentBackground={true} />
      </SpinnerWrapper>
    );
  } else if (isError) {
    if ('status' in error && error.status === 404) {
      return <Text>{t('error.not-found')}</Text>;
    }
  } else if (isSuccess) {
    return (
      <ThemeProvider theme={theme}>
        {crosswalkData.state === State.Removed ? ( // Return stub if crosswalk is removed
          <CrosswalkTabmenu
            contentType={Type.Crosswalk}
            isRemoved={true}
            tabPanels={[
              {
                tabIndex: 0,
                tabText: 'metadata-and-files-tab',
                content: (
                  <MetadataStub metadata={crosswalkData} type={Type.Crosswalk} />
                )
              }
            ]}
          />
        ) : (
          <CrosswalkTabmenu
            contentType={Type.Crosswalk}
            tabPanels={[
              {
                tabIndex: 0,
                tabText: 'metadata-and-files-tab',
                content: (
                  <MetadataAndFiles
                    crosswalkData={crosswalkData}
                    refetch={refetch}
                  />
                )
              },
              {
                tabIndex: 1,
                tabText: 'content-and-editor-tab',
                content: (
                  <CrosswalkEditor crosswalkData={crosswalkData} hasEditPermission={hasEditPermission}
                                   nodeMappings={nodeMappings} isEditModeActive={isEditModeActive}
                                   showAttributeNames={showAttributeNames} setShowAttributeNames={setShowAttributeNames}
                                   sourceTreeSelection={sourceTreeSelection}
                                   scrollToSelectedSourceNodeId={scrollToSelectedSourceNodeId}
                                   scrollToSelectedTargetNodeId={scrollToSelectedTargetNodeId}
                                   deleteMappingResponse={deleteMappingResponse}
                                   setIsMappingPatchOperation={setIsMappingPatchOperation}
                                   isNodeMappingsModalOpen={isNodeMappingsModalOpen}
                                   setNodeMappingsModalOpen={setNodeMappingsModalOpen}
                                   mappingToBeEdited={mappingToBeEdited}
                                   setMappingToBeEdited={setMappingToBeEdited}
                                   isPatchMappingOperation={isPatchMappingOperation}
                                   targetTreeSelection={targetTreeSelection}
                                   isOneToManyMapping={isOneToManyMapping}
                                   setIsOneToManyMapping={setIsOneToManyMapping}
                                   mappingFunctions={mappingFunctions}
                                   performCallbackFromAccordionAction={performCallbackFromAccordionAction}
                                   sourceSchemaFormat={sourceSchemaFormat}
                                   targetSchemaFormat={targetSchemaFormat}
                                   mappingFilters={mappingFilters}
                                   highlightOperation={highlightOperation}
                                   performCallbackFromMappingsModal={performCallbackFromMappingsModal}
                                   sourceSchemaData={sourceSchemaData}
                                   targetSchemaData={targetSchemaData}
                                   setPatchSourceNodes={setPatchSourceNodes}
                                   setPatchTargetNodes={setPatchTargetNodes}/>
                )
              },
              {
                tabIndex: 2,
                tabText: 'mapping-accordion-tab',
                content: (
                  <>
                    <div className="joint-listing-accordion-wrap my-3">
                      <MappingsAccordion
                        nodeMappings={nodeMappings}
                        viewOnlyMode={false}
                        isEditModeActive={
                          isEditModeActive && crosswalkData.state !== State.Published
                        }
                        showAttributeNames={showAttributeNames}
                        mappingFunctions={mappingFunctions}
                        performAccordionAction={performCallbackFromAccordionAction}
                        schemaFormats={{sourceSchemaFormat: sourceSchemaFormat, targetSchemaFormat: targetSchemaFormat}}
                        schemaDatas={{sourceSchemaData: sourceSchemaData, targetSchemaData: targetSchemaData}}
                        setNodeMappingsModalOpen={setNodeMappingsModalOpen}
                      />
                    </div>

              {mappingToBeEdited && (
                <NodeMappingsModal
                  nodeSelections={mappingToBeEdited}
                  performMappingsModalAction={performCallbackFromMappingsModal}
                  mappingFilters={mappingFilters}
                  mappingFunctions={mappingFunctions}
                  modalOpen={isNodeMappingsModalOpen}
                  isPatchMappingOperation={isPatchMappingOperation}
                  isOneToManyMapping={isOneToManyMapping}
                  highlightOperation={highlightOperation}
                />
              )}
                    </>)
                    },
                    {
                      tabIndex: 3,
                      tabText: 'history-tab',
                      content: (
                      <VersionHistory
                      revisions={crosswalkData.revisions}
                    contentType={Type.Crosswalk}
                    currentRevision={crosswalkId}
                  />
                )
            }
            ]}
            />
            )}
            {confirmModalIsOpen.deleteDraft && (
              <ConfirmModal
                actionText={t('actionmenu.delete-crosswalk')}
                cancelText={t('action.cancel')}
                confirmAction={deleteCrosswalkDraft}
                onClose={() => dispatch(setConfirmModalState({key: 'deleteDraft', value: false}))}
                heading={t('confirm-modal.heading')}
                text1={t('confirm-modal.delete-draft')}
                text2={t('confirm-modal.delete-draft-info')}
              />
            )}
            {confirmModalIsOpen.remove && (
              <ConfirmModal
                actionText={t('actionmenu.delete-crosswalk')}
            cancelText={t('action.cancel')}
            confirmAction={removeCrosswalk}
            onClose={() => dispatch(setConfirmModalState({key: 'remove', value: false}))}
            heading={t('confirm-modal.heading')}
            text1={t('confirm-modal.delete-crosswalk')}
            text2={t('confirm-modal.delete-info')}
          />
        )}
        {confirmModalIsOpen.publish && (
          <ConfirmModal
            actionText={t('action.publish')}
            cancelText={t('action.cancel')}
            confirmAction={publishCrosswalk}
            onClose={() => dispatch(setConfirmModalState({key: 'publish', value: false}))}
            heading={t('confirm-modal.heading')}
            text1={t('confirm-modal.publish-crosswalk1')}
            text2={t('confirm-modal.publish-crosswalk2')}
          />
        )}
        {confirmModalIsOpen.invalidate && (
          <ConfirmModal
            actionText={t('action.invalidate')}
            cancelText={t('action.cancel')}
            confirmAction={invalidateCrosswalk}
            onClose={() => dispatch(setConfirmModalState({key: 'invalidate', value: false}))}
            heading={t('confirm-modal.heading')}
            text1={t('confirm-modal.invalidate-crosswalk')}
          />
        )}
        {confirmModalIsOpen.deprecate && (
          <ConfirmModal
            actionText={t('action.deprecate')}
            cancelText={t('action.cancel')}
            confirmAction={deprecateCrosswalk}
            onClose={() => dispatch(setConfirmModalState({key: 'deprecate', value: false}))}
            heading={t('confirm-modal.heading')}
            text1={t('confirm-modal.deprecate-crosswalk')}
          />
        )}
        <FormModal
          modalType={
            crosswalkData?.format === Format.Mscr
              ? ModalType.RevisionMscr
              : ModalType.RevisionFull
          }
          contentType={Type.Crosswalk}
          visible={formModalIsOpen.version}
          setVisible={(value) => dispatch(setFormModalState({key: 'version', value: value}))}
          initialData={crosswalkData}
        />
      </ThemeProvider>
    );
  }

  // TODO: What to return if data fetching doesn't work?
  return <Text>{t('error.not-found')}</Text>;
}
