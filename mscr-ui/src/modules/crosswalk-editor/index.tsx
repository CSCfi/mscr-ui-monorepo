import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
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
import SchemaInfo from '@app/common/components/schema-info';
import { useTranslation } from 'next-i18next';
import { CrosswalkWithVersionInfo } from '@app/common/interfaces/crosswalk.interface';
import { State } from '@app/common/interfaces/state.interface';
import Tooltip from '@mui/material/Tooltip';
import {SchemaWithContent} from "@app/common/interfaces/schema.interface";
import {Format} from "@app/common/interfaces/format.interface";
import _ from "lodash";
import MappingsAccordion2 from "@app/modules/crosswalk-editor/mappings-accordion2";
import { useSelector } from 'react-redux';
import { selectSelectedNodes, setSelectedNodes } from '@app/common/components/crosswalk/crosswalk.slice';
import { useStoreDispatch } from '@app/store';

export default function CrosswalkEditor({
                                          crosswalkData, hasEditPermission,
                                          nodeMappings, isEditModeActive,
                                          showAttributeNames,
                                          setShowAttributeNames, sourceTreeSelection,
                                          scrollToSelectedSourceNodeId,
                                          scrollToSelectedTargetNodeId,
                                          setIsMappingPatchOperation,
                                          isNodeMappingsModalOpen, setNodeMappingsModalOpen,
                                          mappingToBeEdited, setMappingToBeEdited,
                                          isPatchMappingOperation, targetTreeSelection,
                                          isOneToManyMapping, setIsOneToManyMapping, mappingFunctions,
                                          performCallbackFromAccordionAction, sourceSchemaFormat, targetSchemaFormat,
                                          mappingFilters, highlightOperation, performCallbackFromMappingsModal,
                                          sourceSchemaData, targetSchemaData,
                                          setPatchSourceNodes, setPatchTargetNodes
}: {
  crosswalkData: CrosswalkWithVersionInfo;
  hasEditPermission: boolean;
  nodeMappings: NodeMapping[];
  isEditModeActive: boolean;
  showAttributeNames: boolean;
  setShowAttributeNames: Dispatch<SetStateAction<boolean>>;
  sourceTreeSelection: string[];
  scrollToSelectedSourceNodeId: string | undefined;
  scrollToSelectedTargetNodeId: string | undefined;
  deleteMappingResponse:  any;
  setIsMappingPatchOperation:  Dispatch<SetStateAction<boolean>>;
  isNodeMappingsModalOpen: boolean;
  setNodeMappingsModalOpen:  Dispatch<SetStateAction<boolean>>;
  mappingToBeEdited:  CrosswalkConnectionNew[] | undefined;
  setMappingToBeEdited:  Dispatch<SetStateAction<CrosswalkConnectionNew[] | undefined>>;
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
  setPatchSourceNodes:  Dispatch<SetStateAction<RenderTree[]>>;
  setPatchTargetNodes:  Dispatch<SetStateAction<RenderTree[]>>;
}) {
  const { t } = useTranslation('common');

  // STATE VARIABLES
  const [sourceSchemaUrn, setSourceSchemaUrn] = useState<string>('');
  const [targetSchemaUrn, setTargetSchemaUrn] = useState<string>('');

  const selectedNodes = useSelector(selectSelectedNodes());
  const selectedTargetNodes = useMemo((): RenderTree[] => selectedNodes.target ?? [], [selectedNodes.target]);
  const selectedSourceNodes = useMemo((): RenderTree[] => selectedNodes.source ?? [], [selectedNodes.source]);
  const dispatch = useStoreDispatch();

  useEffect(() => {
    if (crosswalkData?.sourceSchema) {
      setSourceSchemaUrn(crosswalkData.sourceSchema);
    }
    if (crosswalkData?.targetSchema) {
      setTargetSchemaUrn(crosswalkData.targetSchema);
    }
    dispatch(setSelectedNodes({target: [], source: []}));
  }, [crosswalkData, dispatch]);

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

  return (
    <div className="row d-flex justify-content-between crosswalk-editor">
      <div className="col-12 mx-1">
        <div className="row gx-0">
          {/*  SOURCE TREE */}
          <div className="col-3">
            <SchemaInfo
              isSourceTree={true}
              treeSelection={sourceTreeSelection}
              caption={t('crosswalk-editor.search-from-source-schema')}
              schemaUrn={sourceSchemaUrn}
              scrollToSelectedNodeId={scrollToSelectedSourceNodeId}
              nodeMappings={nodeMappings}
            />
          </div>


          <div className="col-6">
            <MappingsAccordion2
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
              addMappingButtonClick={addMappingButtonClick}
              hasEditPermission={hasEditPermission}
              crosswalkData={crosswalkData}
            />
          </div>

          {/*  TARGET TREE */}
          <div className="col-3">
            <SchemaInfo
              isSourceTree={false}
              treeSelection={targetTreeSelection}
              caption={t('crosswalk-editor.search-from-target-schema')}
              schemaUrn={targetSchemaUrn}
              scrollToSelectedNodeId={scrollToSelectedTargetNodeId}
              nodeMappings={nodeMappings}
            />
          </div>
        </div>
      </div>
      {mappingToBeEdited && (
        <NodeMappingsModal
          nodeSelections={mappingToBeEdited}
          crosswalkSubType={crosswalkData.subType}
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
