import * as React from 'react';
import { useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Checkbox, SearchInput, ToggleButton } from 'suomifi-ui-components';
import IconButton from '@mui/material/IconButton';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Box from '@mui/material/Box';
import SchemaTree from '@app/modules/schema-view/schema-info/schema-tree';
import NodeInfo from '@app/modules/schema-view/schema-info/schema-tree/node-info';
import { RenderTree } from '@app/common/interfaces/crosswalk-connection.interface';
import { cloneDeep } from 'lodash';
import { generateTreeFromJson } from '@app/modules/schema-view/schema-info/schema-tree/schema-tree-renderer';
import {
  selectIsSchemaEditModeActive,
  useGetFrontendSchemaQuery,
} from '@app/common/components/schema/schema.slice';
import { useTranslation } from 'next-i18next';
import {
  CheckboxWrapper,
  ExpandButtonWrapper,
  NodeInfoWrapper,
  SchemaHeading,
  SearchWrapper,
  TreeviewWrapper,
} from '@app/modules/schema-view/schema-info/schema-info.styles';
import { useRouter } from 'next/router';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import SpinnerOverlay, {
  SpinnerType,
} from '@app/common/components/spinner-overlay';
import Tooltip from '@mui/material/Tooltip';
import { useSelector } from 'react-redux';
import { State } from '@app/common/interfaces/state.interface';

export default function SchemaInfo(props: {
  updateTreeNodeSelectionsOutput?: (
    nodeIds: RenderTree[],
    isSourceSchema: boolean
  ) => void;
  isSourceTree?: boolean;
  treeSelection?: string[];
  caption: string;
  schemaUrn: string;
  raiseHeading?: boolean;
  isSingleTree?: boolean;
  hasEditPermission?: boolean;
}) {
  const { t } = useTranslation('common');
  const lang = useRouter().locale ?? '';
  const isSchemaEditActive = useSelector(selectIsSchemaEditModeActive());

  const emptyTreeSelection: RenderTree = {
    elementPath: '',
    qname: 'empty',
    parentElementPath: undefined,
    name: '',
    id: '',
    visualTreeId: '',
    properties: undefined,
    children: [],
    uri: '',
  };

  const {
    data: getSchemaData,
    isLoading: getSchemaDataIsLoading,
    isSuccess: getSchemaDataIsSuccess,
    isError: getSchemaDataIsError,
    error: getSchemaDataError,
  } = useGetFrontendSchemaQuery(props.schemaUrn);

  const [treeDataOriginal, setTreeDataOriginal] = React.useState<RenderTree[]>(
    []
  );
  const [treeData, setTreeData] = React.useState<RenderTree[]>([]);
  const [treeExpandedArray, setTreeExpanded] = React.useState<string[]>([]);

  // These are used by tree visualization
  const [treeSelectedArray, setTreeSelections] = React.useState<string[]>([]);

  // These are used by datamodel
  const [selectedTreeNodes, setSelectedTreeNodes] = React.useState<
    RenderTree[]
  >([emptyTreeSelection]);

  const [isTreeDataFetched, setTreeDataFetched] =
    React.useState<boolean>(false);

  const [showAttributeNames, setShowAttributeNames] = React.useState(true);

  const isNodeEditable =
    (props.hasEditPermission ?? false) &&
    (props.isSingleTree ?? false) &&
    getSchemaData?.metadata.state === State.Draft &&
    isSchemaEditActive;

  useEffect(() => {
    if (getSchemaData?.content) {
      generateTreeFromJson(getSchemaData).then((res) => {
        if (res) {
          // Expand tree when data is loaded
          setExpanded();
          setTreeDataOriginal(cloneDeep(res));
          setTreeData(res);
          setTreeDataFetched(true);
          //refetchOriginalSourceSchemaData();
        }
      });
    }
  }, [getSchemaDataIsSuccess, getSchemaData]);

  // Expand tree when data is loaded
  useEffect(() => {
    setExpanded();
  }, [isTreeDataFetched]);

  // Expand and select nodes when input changed (from mappings accordion)
  useEffect(() => {
    if (props.treeSelection) {
      expandAndSelectNodes(props.treeSelection);
    }
  }, [props.treeSelection]);

  useEffect(() => {
    // Update selections for node info and parent component for mappings
    const selectedTreeNodeIds = getTreeNodesByIds(treeSelectedArray);
    if (
      props.updateTreeNodeSelectionsOutput &&
      props.isSourceTree !== undefined
    ) {
      props.updateTreeNodeSelectionsOutput(
        selectedTreeNodeIds,
        props.isSourceTree
      );
    }
    setSelectedTreeNodes(selectedTreeNodeIds);
  }, [treeSelectedArray]);

  const setExpanded = () => {
    const retData: string[] = [];
    treeData.forEach(({ children, id }) => {
      if (children && children?.length > 0) {
        retData.push(id.toString());
      }
    });
    setTreeExpanded(() => {
      return retData;
    });
  };

  // Used to generate data for mappings modal
  function getTreeNodesByIds(nodeIds: string[]) {
    const foundSourceNodes: RenderTree[] = [];
    return findNodesFromTree(treeDataOriginal, nodeIds, foundSourceNodes);
  }

  // Used to tree filtering
  function findNodesFromTree(
    tree: RenderTree[],
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

  function clearTreeSearch() {
    setTreeSelections([]);
    setTreeData(cloneDeep(treeDataOriginal));
    setExpanded();
  }

  function doFiltering(
    tree: RenderTree[],
    nameToFind: string,
    results: { nodeIds: string[]; childNodeIds: string[] }
  ) {
    tree.forEach((item) => {
      if (
        (showAttributeNames &&
          item.name &&
          item.name.toLowerCase().includes(nameToFind.toLowerCase())) ||
        (!showAttributeNames &&
          item.qname &&
          item.qname.toLowerCase().includes(nameToFind.toLowerCase()))
      ) {
        results.nodeIds.push(item.id);
        if (item.children && item.children.length > 0) {
          item.children.forEach((child) => {
            results.childNodeIds.push(child.id);
          });
        }
      }
      if (item.children && item.children.length > 0) {
        return doFiltering(item.children, nameToFind, results);
      }
    });
    return results;
  }

  function getElementPathsFromTree(
    treeData: RenderTree[],
    nodeIds: string[],
    results: string[]
  ) {
    treeData.forEach((item) => {
      if (nodeIds.includes(item.id)) {
        if (item.elementPath != null) {
          results.push(item.elementPath);
        }
      }
      if (item.children && item.children.length > 0) {
        return getElementPathsFromTree(item.children, nodeIds, results);
      }
    });
    return results;
  }

  // Used by tree select and filtering
  function getAllNodeIdsOnPathToLeaf(nodeIds: string[]) {
    const elementPaths = getElementPathsFromTree(treeData, nodeIds, []);
    const nodesToSelect: Set<string> = new Set();

    elementPaths.forEach((path) => {
      const nodes = path.split('.');
      nodes.forEach((node) => {
        nodesToSelect.add(node);
      });
    });
    return Array.from(nodesToSelect);
  }

  const handleExpandClick = () => {
    const allTreeNodes: string[] = [];
    treeData.forEach(({ children, id }) => {
      if (children && children?.length > 0) {
        allTreeNodes.push(id.toString());
      }
    });
    setTreeExpanded((oldExpanded) => {
      return oldExpanded.length === 0 ? allTreeNodes : [];
    });
  };

  function expandAndSelectNodes(nodeIds: string[]) {
    if (nodeIds.length > 0) {
      const nodeIdsToExpand = getAllNodeIdsOnPathToLeaf(nodeIds);
      setTreeExpanded(nodeIdsToExpand);
      setTreeSelections(nodeIds);
    }
  }

  function searchFromTree(input: string) {
    clearTreeSearch();
    const hits = { nodeIds: [], childNodeIds: [] };
    doFiltering(treeData, input.toString(), hits);
    expandAndSelectNodes(hits.nodeIds);
  }

  function handleTreeClick(nodeIds: string[]) {
    setTreeSelections(nodeIds);
  }

  function handleTreeToggle(nodeIds: string[]) {
    setTreeExpanded(nodeIds);
  }

  // const selectFromTreeById = (nodeId: string) => {
  //   const nodeIds = [];
  //   nodeIds.push(nodeId);
  //   expandAndSelectNodes(nodeIds);
  // };

  const performCallbackFromTreeAction = (action: string, nodeIds: string[]) => {
    if (action === 'handleSelect') {
      handleTreeClick(nodeIds);
    } else if (action === 'treeToggle') {
      handleTreeToggle(nodeIds);
    }
  };

  // const performNodeInfoAction = (nodeId: any, isSourceTree: boolean) => {
  //   selectFromTreeById(nodeId);
  // };

  return (
    <>
      <div className="row d-flex mb-4">
        <div className="col-12">
          <Tooltip
            title={
              getSchemaData?.metadata.label
                ? getLanguageVersion({
                    data: getSchemaData.metadata.label,
                    lang,
                  })
                : t('schema-tree.no-label')
            }
            placement="bottom-start"
          >
            <SchemaHeading variant="h2">
              {getSchemaData?.metadata.label
                ? getLanguageVersion({
                    data: getSchemaData.metadata.label,
                    lang,
                  })
                : t('schema-tree.no-label')}
            </SchemaHeading>
          </Tooltip>
        </div>
      </div>

      <TreeviewWrapper className="row gx-0">
        <div className="col-7 px-0">
          <div className="d-flex justify-content-between mb-2 ps-3 pe-2">
            {isTreeDataFetched && (
              <>
                <SearchWrapper className="w-100">
                  <SearchInput
                    className="py-2"
                    labelText={props.caption}
                    searchButtonLabel={t('schema-tree.search')}
                    clearButtonLabel={t('schema-tree.clear')}
                    visualPlaceholder={t('schema-tree.search-placeholder')}
                    onSearch={(value) => {
                      if (typeof value === 'string') {
                        searchFromTree(value);
                      }
                    }}
                    onChange={(value) => {
                      if (!value) {
                        clearTreeSearch();
                      }
                    }}
                  />
                </SearchWrapper>
                <ExpandButtonWrapper>
                  <IconButton
                    onClick={() => handleExpandClick()}
                    aria-label={t('schema-tree.expand')}
                    color="primary"
                    size="large"
                  >
                    {treeExpandedArray.length === 0 ? (
                      <ExpandMoreIcon />
                    ) : (
                      <ExpandLessIcon />
                    )}
                  </IconButton>
                </ExpandButtonWrapper>
              </>
            )}
          </div>
          <div>
            <Box
              className="px-3 d-flex"
              sx={{
                height: 460,
                flexGrow: 1,
                maxWidth: 700,
                overflowY: 'auto',
              }}
            >
              <>
                <div className="d-flex justify-content-center">
                  <SpinnerOverlay
                    animationVisible={!isTreeDataFetched}
                    type={
                      props.isSingleTree
                        ? SpinnerType.SchemaTreeSingle
                        : SpinnerType.SchemaTreeDouble
                    }
                  ></SpinnerOverlay>
                </div>
              </>
              {isTreeDataFetched && (
                <SchemaTree
                  nodes={treeData[0]}
                  treeSelectedArray={treeSelectedArray}
                  treeExpanded={treeExpandedArray}
                  performTreeAction={performCallbackFromTreeAction}
                  showQname={!showAttributeNames}
                />
              )}
            </Box>
          </div>
        </div>
        <NodeInfoWrapper className="col-5 px-0">
          <NodeInfo
            treeData={selectedTreeNodes}
            // performNodeInfoAction={performNodeInfoAction}
            dataIsLoaded={isTreeDataFetched}
            isEditable={isNodeEditable}
          />
          <CheckboxWrapper>
            <Checkbox
              checked={showAttributeNames}
              onClick={(newState) => {
                setShowAttributeNames(newState.checkboxState);
              }}
            >
              Show node titles
            </Checkbox>
          </CheckboxWrapper>
        </NodeInfoWrapper>
      </TreeviewWrapper>
    </>
  );
}
