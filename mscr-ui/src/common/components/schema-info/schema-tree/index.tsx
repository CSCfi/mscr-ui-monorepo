import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircleIcon from '@mui/icons-material/Circle';
import { useTranslation } from 'next-i18next';
import {NodeMapping, RenderTree} from '@app/common/interfaces/crosswalk-connection.interface';
import Tooltip from "@mui/material/Tooltip";

function returnIconForMappedNode(nodeMappings: NodeMapping[], node: any, isSourceTree: boolean) {
  let foundMappings = null;
  if (isSourceTree) {
    if (nodeMappings ) {
      foundMappings = nodeMappings.find(nodeMapping => nodeMapping.source.find(sourceItem => sourceItem.id === node.id));
    }
  } else {
    if (nodeMappings) {
      foundMappings = nodeMappings.find(nodeMapping => nodeMapping.target.find(targetItem => targetItem.id === node.id));
    }
  }
  if (foundMappings != null) {
    return <Tooltip title={'Schema tree node is used on Crosswalk mapping.'} placement="bottom">
      <CircleIcon style={{color: "#1976d2", maxHeight: "25%", maxWidth: "25%"}}/>
    </Tooltip>;
  } else {
    return <></>;
  }
}

function toTree(nodes: RenderTree, showQname: boolean, nodeMappings: NodeMapping[], isSourceTree: boolean) {
  let ret = undefined;
  if (Array.isArray(nodes)) {
    return nodes.map((node) => {
      return (
        <div style={{display: 'flex'}}><TreeItem
          key={node.visualTreeId}
          nodeId={node.id}
          label={showQname ? node.qname : node.name}
          className="linked-tree-item"
        >
          {Array.isArray(node.children)
            ? node.children.map((node: RenderTree) => toTree(node, showQname, nodeMappings, isSourceTree))
            : null}
        </TreeItem>{returnIconForMappedNode(nodeMappings, node, isSourceTree)} </div>
      );
    });
  } else {
    ret = (
      <div style={{display: 'flex'}}><TreeItem
        key={nodes.visualTreeId}
        nodeId={nodes.id}
        label={showQname ? nodes.qname : nodes.name}
        className="linked-tree-item"
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node: RenderTree) => toTree(node, showQname, nodeMappings, isSourceTree))
          : null}
      </TreeItem>{returnIconForMappedNode(nodeMappings, nodes, isSourceTree)} </div>
    );
    return ret;
  }
}

export default function SchemaTree({
  nodes,
  treeSelectedArray,
  treeExpanded,
  performTreeAction,
  showQname,
  isSourceTree,
  nodeMappings,
}: {
  nodes: RenderTree[];
  treeSelectedArray: string[];
  treeExpanded: string[];
  performTreeAction: (action: string, nodeIds: string[]) => void;
  showQname: boolean;
  isSourceTree: boolean | undefined;
  nodeMappings?: NodeMapping[];
}) {
  const { t } = useTranslation('common');

  const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
    performTreeAction('handleSelect', nodeIds);
  };

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    performTreeAction('treeToggle', nodeIds);
  };

  // console.log('TREEVIEW DATA', nodes, treeSelectedArray);
  return (
    <TreeView
      id={isSourceTree ? 'source' : 'target'}
      aria-label={t('schema-tree.tree-label')}
      expanded={treeExpanded}
      selected={treeSelectedArray}
      onNodeSelect={handleSelect}
      onNodeToggle={handleToggle}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      multiSelect
    >
      {nodes.map((node: RenderTree) => toTree(node, showQname, nodeMappings, isSourceTree))}
    </TreeView>
  );
}
