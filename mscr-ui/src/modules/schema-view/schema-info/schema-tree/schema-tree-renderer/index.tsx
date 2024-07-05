import {cloneDeep} from "lodash";
import {RenderTree, RenderTreeOld} from "@app/common/interfaces/crosswalk-connection.interface";

export default function MockupSchemaLoader(emptyTemplate: boolean): Promise<RenderTree[] | undefined> {

    let allTreeNodes: RenderTreeOld[] = [];

    let currentTreeNode: RenderTreeOld = {
        idNumeric: 0,
        id: '0',
        name: '',
        isLinked: false,
        title: '',
        type: '',
        description: '',
        required: '',
        isMappable: '',
        parentName: '',
        jsonPath: '$schema',
        parentId: 0,
        children: []
    };

    let nodeId = 0;

    function increaseNodeNumber() {
        nodeId += 1;
    }

    function createTreeObject(object: string, value: string, parent: string, rootId: any, jsonPath: string) {
        currentTreeNode.jsonPath = jsonPath + '.' + object;
        currentTreeNode.idNumeric = nodeId;
        currentTreeNode.id = nodeId.toString();
        currentTreeNode.parentId = rootId;
        currentTreeNode.name = object;
        currentTreeNode.title = value;
        currentTreeNode.parentName = parent;
        increaseNodeNumber();
    }

    function walkJson(json_object: any, parent: any, rootId: number, jsonPath: string) {
        for (const obj in json_object) {
            if (typeof json_object[obj] === 'string') {
                //console.log(`leaf ${obj} = ${json_object[obj]}`);

                // OBJECT IS A LEAF LEVEL OBJECT
                currentTreeNode = {
                    isLinked: false,
                    idNumeric: 0,
                    id: '0',
                    name: '',
                    title: '',
                    type: 'string',
                    description: '',
                    required: '',
                    parentId: 0,
                    jsonPath,
                    children: []
                };
                createTreeObject(obj, json_object[obj], parent, rootId, jsonPath);
                allTreeNodes.push(cloneDeep(currentTreeNode));
            } else {
                // OBJECT HAS CHILDREN
                currentTreeNode = {
                    isLinked: false,
                    idNumeric: 0,
                    id: '0',
                    name: '',
                    title: '',
                    type: Array.isArray(json_object[obj]) ? 'array' : 'composite',
                    description: '',
                    required: '',
                    parentId: 0,
                    jsonPath,
                    children: []
                };
                currentTreeNode.name = obj;
                currentTreeNode.parentName = parent;
                currentTreeNode.parentId = rootId;
                currentTreeNode.idNumeric = nodeId;
                currentTreeNode.id = nodeId.toString();


                currentTreeNode.jsonPath = jsonPath + '.' + obj;
                increaseNodeNumber();
                allTreeNodes.push(cloneDeep(currentTreeNode));
                walkJson(json_object[obj], obj, nodeId - 1, currentTreeNode.jsonPath);
            }
        }
        return allTreeNodes;
    }


    function walkJsonOld(json_object: any, parent: any, rootId: number, jsonPath: string) {
        for (const obj in json_object) {
            if (typeof json_object[obj] === 'string') {
                //console.log(`leaf ${obj} = ${json_object[obj]}`);

                // OBJECT IS A LEAF LEVEL OBJECT
                currentTreeNode = {
                    isLinked: false,
                    idNumeric: 0,
                    id: '0',
                    name: '',
                    title: '',
                    type: 'string',
                    description: '',
                    required: '',
                    parentId: 0,
                    jsonPath,
                    children: []
                };
                createTreeObject(obj, json_object[obj], parent, rootId, jsonPath);
                allTreeNodes.push(cloneDeep(currentTreeNode));
            } else if (typeof json_object[obj] === 'boolean') {
                //console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! FOUND BOOLEAN', obj, json_object[obj], json_object);

                // OBJECT IS A LEAF LEVEL OBJECT
                currentTreeNode = {
                    isLinked: false,
                    idNumeric: 0,
                    id: '0',
                    name: '',
                    title: '',
                    type: json_object[obj].toString(),
                    description: '',
                    required: '',
                    parentId: 0,
                    jsonPath,
                    children: []
                };
                createTreeObject(obj, json_object[obj], parent, rootId, jsonPath);
                allTreeNodes.push(cloneDeep(currentTreeNode));
            } else {
                // OBJECT HAS CHILDREN
                currentTreeNode = {
                    isLinked: false,
                    idNumeric: 0,
                    id: '0',
                    name: '',
                    title: '',
                    type: Array.isArray(json_object[obj]) ? 'array' : 'composite',
                    description: '',
                    required: '',
                    parentId: 0,
                    jsonPath,
                    children: []
                };
                currentTreeNode.name = obj;
                currentTreeNode.parentName = parent;
                currentTreeNode.parentId = rootId;
                currentTreeNode.idNumeric = nodeId;
                currentTreeNode.id = nodeId.toString();


                currentTreeNode.jsonPath = jsonPath + '.' + obj;
                increaseNodeNumber();
                allTreeNodes.push(cloneDeep(currentTreeNode));
                walkJsonOld(json_object[obj], obj, nodeId - 1, currentTreeNode.jsonPath);
            }
        }
        return allTreeNodes;
    }

    function mergeAttributesToParent(inputNodes: RenderTreeOld[] | undefined) {
        if (inputNodes) {
            let outputNodes = inputNodes.map((parent: RenderTreeOld) => {
                    if (parent.children) {
                        let i = parent.children.length;
                        while (i--) {
                            // @ts-ignore
                            if (parent.children[i] && parent.children[i].children.length > 0) {
                                mergeAttributesToParent([parent.children[i]]);
                            }
                            if (parent.children[i].name === 'type') {
                                parent.type = parent.children[i].title;
                                //parent.children.splice(i, 1);
                            } else if (parent.children[i].name === 'description') {
                                parent.description = parent.children[i].title;
                                //parent.children.splice(i, 1);
                            } else if (parent.children[i].name === 'title') {
                                parent.title = parent.children[i].title;
                                //parent.children.splice(i, 1);
                            }
                        }
                    }
                    return parent;
                }
            );
            return outputNodes;
        }
    }

    // Unused
    function reverseTreeChildren(inputNodes: RenderTreeOld[] | undefined) {
        if (inputNodes) {
            for (let i = 0; i < inputNodes.length; i += 1) {
                // @ts-ignore
                if (inputNodes[i].children.length > 1) {
                    // @ts-ignore
                    inputNodes[i].children = inputNodes[i].children.reverse()
                    reverseTreeChildren(inputNodes[i].children);
                }
            }
            return inputNodes;
        }
    }
}
let treeIndex = 0;

function createRenderTree(
  input: any,
  elementPath: string,
  definitions: any,
  index: { [key: string]: RenderTree },
  dictionary: { [key: string]: string[] }
) {
  const retArray: RenderTree[] = [];
  for (const obj in input) {
    treeIndex += 1;
    const newNode: RenderTree = {
      name: definitions[obj].title,
      qname: definitions[obj]?.qname ? definitions[obj]?.qname : 'empty',
      visualTreeId: treeIndex.toString(),
      id: obj.toString(),
      properties: definitions[obj],
      elementPath: elementPath + '.' + obj.toString(),
      parentElementPath: elementPath,
      children: [],
      uri: definitions[obj]['@id'],
    };
    index[treeIndex.toString()] = newNode;
    dictionary[obj.toString()] = dictionary[obj.toString()] ?? [];
    dictionary[obj.toString()].push(treeIndex.toString());

    //console.log('OBJ', obj, input[obj].keys, Object.keys(input[obj]));
    if (Object.keys(input[obj]).length > 0) {
      // HAS CHILDREN
      newNode.children = createRenderTree(
        input[obj],
        newNode.elementPath,
        definitions,
        index,
        dictionary
      );
    } else {
      // IS LEAF
    }
    retArray.push(newNode);
  }
  return retArray;
}

export function generateTreeFromJson(jsonInput: any) {
  const schemaPropertyShallowIndex: { [key: string]: RenderTree } = {};
  const nodeIdToIndexDictionary: {[key: string]: string[]} = {};
  const treeRoot: RenderTree = {
    name: 'ROOT',
    qname: 'ROOT',
    visualTreeId: '0',
    id: 'ROOT',
    properties: undefined,
    uri: '',
    elementPath: 'ROOT',
    parentElementPath: undefined,
    children: [],
  };
  schemaPropertyShallowIndex['0'] = treeRoot;
  nodeIdToIndexDictionary['ROOT'] = ['0'];

  const generatedTree = new Promise<RenderTree[]>((resolve) => {
    const renderedTree = createRenderTree(
      jsonInput.content.tree,
      'ROOT',
      jsonInput.content.definitions,
      schemaPropertyShallowIndex,
      nodeIdToIndexDictionary,
    );
    const retTree: RenderTree[] = [];
    treeRoot.children = renderedTree;
    retTree.push(treeRoot);
    // console.log('renderedTree', renderedTree);
    resolve(retTree);
    });
  return {generatedTree: generatedTree, propertyIndex: schemaPropertyShallowIndex, idToIndexDictionary: nodeIdToIndexDictionary};
}
