import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import { Button as Sbutton, Checkbox } from 'suomifi-ui-components';
import MappingsAccordion, {
  highlightOperation,
} from '@app/modules/crosswalk-editor/mappings-accordion';
import {
  CrosswalkConnectionNew,
  RenderTree,
  NodeMapping,
} from '@app/common/interfaces/crosswalk-connection.interface';
import NodeMappingsModal from './tabs/node-mappings';
import LinkIcon from '@app/common/components/shared-icons';
import {
  usePutMappingMutation,
  useDeleteMappingMutation,
  usePatchMappingMutation,
  useGetMappingsQuery,
} from '@app/common/components/crosswalk/crosswalk.slice';
import { useGetCrosswalkMappingFunctionsQuery } from '@app/common/components/crosswalk-functions/crosswalk-functions.slice';
import SchemaInfo from '@app/common/components/schema-info';
import { useTranslation } from 'next-i18next';
import { CrosswalkWithVersionInfo } from '@app/common/interfaces/crosswalk.interface';
import { useSelector } from 'react-redux';
import { selectIsEditContentActive } from '@app/common/components/content-view/content-view.slice';
import { State } from '@app/common/interfaces/state.interface';
import Tooltip from '@mui/material/Tooltip';
import {useGetFrontendSchemaQuery, useGetSchemaQuery} from "@app/common/components/schema/schema.slice";
import {SchemaWithContent} from "@app/common/interfaces/schema.interface";
import {Format} from "@app/common/interfaces/format.interface";
import {MutationDefinition, QueryStatus} from "@reduxjs/toolkit/query";
import {AxiosBaseQueryArgs, AxiosBaseQueryError} from "yti-common-ui/interfaces/axios-base-query.interface";
import {BaseQueryFn} from "@reduxjs/toolkit/dist/query";

export default function CrosswalkEditor({
  crosswalkId,
  crosswalkData,
  hasEditPermission,
  nodeMappings,
  setNodeMappings,
  isEditModeActive,
  showAttributeNames,
  setShowAttributeNames, sourceTreeSelection,
  setSourceTreeSelection,
  scrollToSelectedSourceNodeId,
  scrollToSelectedTargetNodeId, deleteMappingResponse, setIsMappingPatchOperation,
                                          isNodeMappingsModalOpen, setNodeMappingsModalOpen,
                                          mappingToBeEdited, setMappingToBeEdited, patchPid, putMappingResponse,
                                          patchMappingResponse, isPatchMappingOperation, targetTreeSelection,
                                          isOneToManyMapping, setIsOneToManyMapping, mappingFunctions,
                                          performCallbackFromAccordionAction, sourceSchemaFormat, targetSchemaFormat,
                                          sourceSchemaData, targetSchemaData, performCallbackFromMappingsModal,
                                          mappingFilters, highlightOperation, mappingsFromBackend, getMappingsDataIsSuccess,
                                          setPatchSourceNodes, setPatchTargetNodes
}: {
  crosswalkId: string;
  crosswalkData: CrosswalkWithVersionInfo;
  hasEditPermission: boolean;
  nodeMappings: NodeMapping[];
  setNodeMappings: Dispatch<SetStateAction<NodeMapping[]>>;
  isEditModeActive: boolean;
  showAttributeNames: boolean;
  setShowAttributeNames: Dispatch<SetStateAction<boolean>>;
  sourceTreeSelection: string[];
  setSourceTreeSelection: Dispatch<SetStateAction<string[]>>;
  scrollToSelectedSourceNodeId: string | undefined;
  scrollToSelectedTargetNodeId: string | undefined;
  deleteMappingResponse:  any;
  setIsMappingPatchOperation:  Dispatch<SetStateAction<boolean>>;
  isNodeMappingsModalOpen: boolean;
  setNodeMappingsModalOpen:  Dispatch<SetStateAction<boolean>>;
  mappingToBeEdited:  CrosswalkConnectionNew[] | undefined;
  setMappingToBeEdited:  Dispatch<SetStateAction<CrosswalkConnectionNew[] | undefined>>;
  patchPid: string;
  putMappingResponse: any;
  patchMappingResponse: any;
  isPatchMappingOperation: boolean;
  targetTreeSelection: string[];
  isOneToManyMapping: boolean;
  setIsOneToManyMapping: Dispatch<SetStateAction<boolean>>;
  mappingFunctions: any;
  performCallbackFromAccordionAction: Function;
  sourceSchemaFormat: Format | undefined;
  targetSchemaFormat: Format | undefined;
  sourceSchemaData: SchemaWithContent | undefined;
  targetSchemaData: SchemaWithContent | undefined;
  performCallbackFromMappingsModal: Function;
  mappingFilters: any;
  highlightOperation: highlightOperation | undefined;
  mappingsFromBackend: NodeMapping[] | undefined;
  getMappingsDataIsSuccess: boolean;
  setPatchSourceNodes:  Dispatch<SetStateAction<RenderTree[]>>;
  setPatchTargetNodes:  Dispatch<SetStateAction<RenderTree[]>>;
}) {
  const { t } = useTranslation('common');

  // STATE VARIABLES
  const [sourceSchemaUrn, setSourceSchemaUrn] = useState<string>('');
  const [targetSchemaUrn, setTargetSchemaUrn] = useState<string>('');

  const [selectedSourceNodes, setSelectedSourceNodes] = useState<RenderTree[]>(
    []
  );
  const [selectedTargetNodes, setSelectedTargetNodes] = useState<RenderTree[]>(
    []
  );

  const [linkingError] = useState<string>('');

  console.log('Marko: crosswalk-editor index.ts alussa: isNodeMappingsModalOpen) = ' + isNodeMappingsModalOpen);

  useEffect(() => {
    if (crosswalkData?.sourceSchema) {
      setSourceSchemaUrn(crosswalkData.sourceSchema);
    }
    if (crosswalkData?.targetSchema) {
      setTargetSchemaUrn(crosswalkData.targetSchema);
    }
  }, [crosswalkData]);


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

  return (
    <div className="row d-flex justify-content-between crosswalk-editor">
      <div className="col-12 mx-1">
        <div className="row gx-0">
          {/*  SOURCE TREE */}
          <div className="col-5">
            <SchemaInfo
              updateTreeNodeSelectionsOutput={performCallbackFromSchemaInfo}
              isSourceTree={true}
              treeSelection={sourceTreeSelection}
              caption={t('crosswalk-editor.search-from-source-schema')}
              schemaUrn={sourceSchemaUrn}
              scrollToSelectedNodeId={scrollToSelectedSourceNodeId}
            />
          </div>

          {/*  MID BUTTONS */}
          <div className="col-2 px-4 mid-buttons">
            {hasEditPermission && (
              <Tooltip
                title={
                  selectedSourceNodes.length > 1 &&
                  selectedTargetNodes.length > 1
                    ? 'Many to many node mappings are not supported'
                    : !isEditModeActive
                      ? 'Activate edit mode to enable mappings'
                      : 'Map selected nodes'
                }
                placement="bottom"
              >
                <Sbutton
                  className="link-button"
                  disabled={
                    selectedSourceNodes.length < 1 ||
                    selectedTargetNodes.length < 1 ||
                    crosswalkData.state === State.Published ||
                    (selectedSourceNodes.length > 1 &&
                      selectedTargetNodes.length > 1) ||
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
              updateTreeNodeSelectionsOutput={performCallbackFromSchemaInfo}
              isSourceTree={false}
              treeSelection={targetTreeSelection}
              caption={t('crosswalk-editor.search-from-target-schema')}
              schemaUrn={targetSchemaUrn}
              scrollToSelectedNodeId={scrollToSelectedTargetNodeId}
            />
          </div>
        </div>
      </div>
      <div className="col-12 mt-4">
        <div className="d-flex justify-content-between">
          <div className="align-self-end pe-1">
            {/*TODO: Checkbox can be removed as deprecatmappingFunctionsed when all new style titles work*/}
            <Checkbox
              checked={showAttributeNames}
              onClick={(newState) => {
                setShowAttributeNames(newState.checkboxState);
              }}
            >
              {t('crosswalk-editor.show-node-titles')}
            </Checkbox>
          </div>
        </div>

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
    </div>
  );
}
