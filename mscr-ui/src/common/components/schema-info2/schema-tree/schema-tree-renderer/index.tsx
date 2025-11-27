import { RenderTree } from '@app/common/interfaces/crosswalk-connection.interface';

let treeIndex = 0;

function createRenderTree(
  input: any,
  rootPathIds: string[],
  definitions: any,
  idToNodeDictionary: { [key: string]: RenderTree[] }
) {
  const retArray: RenderTree[] = [];
  for (const obj in input) {
    const newNode: RenderTree = {
      name: definitions[obj].title,
      qname: definitions[obj]?.qname ? definitions[obj]?.qname : 'empty',
      visualTreeId: treeIndex.toString(),
      id: obj.toString(),
      properties: definitions[obj],
      rootPathIds: [...rootPathIds, obj.toString()],
      children: [],
      uri: definitions[obj]['@id'],
    };
    idToNodeDictionary[newNode.id] = idToNodeDictionary[newNode.id] ?? [];
    idToNodeDictionary[newNode.id].push(newNode);

    //console.log('OBJ', obj, input[obj].keys, Object.keys(input[obj]));
    if (Object.keys(input[obj]).length > 0) {
      // HAS CHILDREN, OTHERWISE IS LEAF
      newNode.children = createRenderTree(
        input[obj],
        newNode.rootPathIds,
        definitions,
        idToNodeDictionary
      );
    }
    retArray.push(newNode);
    treeIndex += 1;
  }
  return retArray;
}

export function generateTreeFromJson(jsonInput: any) {
  // console.log('input-content-tree:', jsonInput.content.tree);
  const nodeIdToShallowNode: { [key: string]: RenderTree[] } = {};

  const generatedTree = new Promise<RenderTree[]>((resolve) => {
    const renderedTree = createRenderTree(
      jsonInput.content.tree,
      [],
      jsonInput.content.definitions,
      nodeIdToShallowNode
    );
    // console.log('renderedTree ', renderedTree);
    resolve(renderedTree);
  });
  return { generatedTree, nodeIdToShallowNode };
}
