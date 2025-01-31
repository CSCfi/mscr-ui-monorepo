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
import SchemaInfo from '@app/common/components/schema-info';
import { useTranslation } from 'next-i18next';
import { CrosswalkWithVersionInfo } from '@app/common/interfaces/crosswalk.interface';
import { State } from '@app/common/interfaces/state.interface';
import Tooltip from '@mui/material/Tooltip';
import {SchemaWithContent} from "@app/common/interfaces/schema.interface";
import {Format} from "@app/common/interfaces/format.interface";
import _ from "lodash";

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

  const [selectedSourceNodes, setSelectedSourceNodes] = useState<RenderTree[]>(
    []
  );
  const [selectedTargetNodes, setSelectedTargetNodes] = useState<RenderTree[]>(
    []
  );

  const [filteredSourceNodeMappings, setFilteredSourceNodeMappings] = useState<NodeMapping[]>([]);
  const [filteredTargetNodeMappings, setFilteredTargetNodeMappings] = useState<NodeMapping[]>([]);
  const [filteredCombinedNodeMappings, setFilteredCombinedNodeMappings] = useState<NodeMapping[]>([]);

  const [linkingError] = useState<string>('');

  useEffect(() => {
    if (crosswalkData?.sourceSchema) {
      setSourceSchemaUrn(crosswalkData.sourceSchema);
    }
    if (crosswalkData?.targetSchema) {
      setTargetSchemaUrn(crosswalkData.targetSchema);
    }
  }, [crosswalkData]);

  useEffect( () => {
    setFilteredSourceNodeMappings(nodeMappings);
    setFilteredTargetNodeMappings(nodeMappings);
    setFilteredCombinedNodeMappings(nodeMappings);
  }, [nodeMappings]);

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

  function filterMappingsWithId(nodeMappingsInput: NodeMapping[], ids: string[], source: boolean) {
    let results: NodeMapping[] = [];

    nodeMappingsInput.forEach(item => {
        if (source) {
          let foundItemsMatchingIds = ids.filter( id => item.source.some(sourceItem => sourceItem.id === id ));
          if (foundItemsMatchingIds.length === ids.length) {
            results.push(item);
          }
        } else {
          let foundItemsMatchingIds = ids.filter( id => item.target.some(targetItem => targetItem.id === id ));
          if (foundItemsMatchingIds.length === ids.length) {
            results.push(item);
          }
        }

      }
    );
    return results;
  }

  const performCallbackFromSchemaInfo = (
    nodeIds: RenderTree[],
    isSourceTree: boolean
  ) => {
    let foundNodeMappings = [];
    if (nodeIds.length > 0 && nodeIds[0] != null) {
      let ids = nodeIds.map(nodeId => nodeId.id);
      foundNodeMappings = filterMappingsWithId(nodeMappings, ids, isSourceTree);
      if (isSourceTree) {
        setFilteredSourceNodeMappings(foundNodeMappings);
        let result = foundNodeMappings.filter(sourceNodeMapping =>
          filteredTargetNodeMappings.some(targetNodeMapping => _.isEqual(sourceNodeMapping, targetNodeMapping)));
        setFilteredCombinedNodeMappings(result);
      } else {
        setFilteredTargetNodeMappings(foundNodeMappings);
        let result = foundNodeMappings.filter(targetNodeMapping =>
          filteredSourceNodeMappings.some(sourceNodeMapping => _.isEqual(sourceNodeMapping, targetNodeMapping)));
        setFilteredCombinedNodeMappings(result);
      }

    } else {
      if (isSourceTree) {
        setFilteredSourceNodeMappings(nodeMappings);
        if (_.isEqual(nodeMappings, filteredTargetNodeMappings)) {
          setFilteredCombinedNodeMappings(nodeMappings);
        } else {
          setFilteredCombinedNodeMappings(filteredTargetNodeMappings);
        }
      } else {
        setFilteredTargetNodeMappings(nodeMappings);
        if (_.isEqual(nodeMappings, filteredSourceNodeMappings)) {
          setFilteredCombinedNodeMappings(nodeMappings);
        } else {
          setFilteredCombinedNodeMappings(filteredSourceNodeMappings);
        }
      }
    }
    
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
            nodeMappings={filteredCombinedNodeMappings}
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
