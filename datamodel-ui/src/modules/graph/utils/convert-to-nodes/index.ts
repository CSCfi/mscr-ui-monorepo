import {
  VisualizationHiddenNode,
  VisualizationType,
} from '@app/common/interfaces/visualization.interface';
import createClassNode from '../create-class-node';
import createCornerNode from '../create-corner-node';
import { Node } from 'reactflow';
import createExternalNode from '../create-external-node';

export default function convertToNodes(
  nodes: VisualizationType[],
  hiddenNodes: VisualizationHiddenNode[],
  modelId: string,
  handleNodeDelete: (id: string) => void,
  applicationProfile?: boolean,
  refetch?: () => void,
  organizationIds?: string[]
): Node[] {
  if (!nodes || nodes.length < 1) {
    return [];
  }

  if (!hiddenNodes || hiddenNodes.length < 1) {
    return nodes.map((node) => {
      return !node.identifier.includes(':')
        ? createClassNode(
            node,
            modelId,
            applicationProfile,
            refetch,
            organizationIds
          )
        : createExternalNode(node, applicationProfile);
    });
  }

  return [
    ...nodes.map((node) => {
      return !node.identifier.includes(':')
        ? createClassNode(
            node,
            modelId,
            applicationProfile,
            refetch,
            organizationIds
          )
        : createExternalNode(node, applicationProfile);
    }),
    ...hiddenNodes.map((node) =>
      createCornerNode(node, handleNodeDelete, applicationProfile)
    ),
  ];
}
