import { RenderTree } from '@app/common/interfaces/crosswalk-connection.interface';
import { Dropdown, DropdownItem, Button } from 'suomifi-ui-components';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { InfoIcon } from '@app/common/components/shared-icons';
import { useTranslation } from 'next-i18next';
import { DropdownWrapper } from '@app/common/components/schema-info/schema-info.styles';
import TypeSelector from '@app/common/components/schema-info/schema-tree/node-info/type-selector';
import {
  setConfirmModalState,
  setSelectedRootNode,
} from '@app/common/components/actionmenu/actionmenu.slice';
import { useStoreDispatch } from '@app/store';
import processHtmlLinks from '@app/common/utils/process-html-links';
import { ConstantAttribute } from '@app/common/interfaces/node.interface';
import RenderAttribute from '@app/common/components/schema-info/schema-tree/node-info/render-attribute';

export default function NodeInfo(props: {
  treeData: RenderTree[];
  currentlySelectedNodeId: string | undefined;
  dataIsLoaded: boolean;
  isNodeEditable?: boolean;
  hasCustomRoot?: boolean;
}) {
  const dispatch = useStoreDispatch();
  const { t } = useTranslation('common');
  const [selectedNode, setSelectedNode] = useState<RenderTree>();
  const [nodeAttributes, setNodeAttributes] = useState<ConstantAttribute[]>([]);
  const isLeafNode = selectedNode?.children.length === 0;
  const [dropDownList, setDropDownList] = useState<RenderTree[]>([]);
  const [nodeTypeAttribute, setNodeTypeAttribute] = useState('');

  useEffect(() => {
    if (props.treeData && props.treeData.length > 0) {
      setDropDownList(props.treeData);
      if (props.currentlySelectedNodeId) {
        handleDropDownSelect(props.currentlySelectedNodeId);
      } else {
        setSelectedNode(props.treeData[0]);
      }
    } else {
      setSelectedNode(undefined);
    }
  }, [props.treeData, props.currentlySelectedNodeId]);

  const handleDropDownSelect = (nodeId: string) => {
    const newSelectedNode = props.treeData.find((item) => item?.id === nodeId);
    setSelectedNode(newSelectedNode ?? selectedNode);
  };

  useEffect(() => {
    if (selectedNode && selectedNode.properties) {
      const nodeProperties: ConstantAttribute[] = [];
      for (const [key, value] of Object.entries(selectedNode.properties)) {
        if (key === '@type' && isLeafNode && props.isNodeEditable) {
          setNodeTypeAttribute(value as string);
          continue;
        }
        let propertyValue;
        if (typeof value === 'string') propertyValue = value.toString();
        if (Array.isArray(value)) propertyValue = value;
        nodeProperties.push({
          name: key,
          value: propertyValue,
        });
      }
      setNodeAttributes(nodeProperties);
    }
  }, [isLeafNode, props.isNodeEditable, selectedNode]);

  function setAsRootNode(node: RenderTree | undefined) {
    dispatch(setSelectedRootNode(node));
    if (node) {
      dispatch(
        setConfirmModalState({ key: 'setRootNodeSelection', value: true })
      );
    } else {
      dispatch(
        setConfirmModalState({ key: 'unsetRootNodeSelection', value: true })
      );
    }
  }

  return (
    <div className="row d-flex justify-content-between node-info-box">
      <h3>{t('node-info.selected-node-info')}</h3>
      <div className="col flex-column d-flex justify-content-between side-bar-wrap">
        <div></div>
        <Box
          className="bg-wrap"
          sx={{
            height: 150,
            flexGrow: 1,
            maxWidth: 300,
            overflowY: 'auto',
          }}
        >
          {props.treeData.length < 1 && (
            <>
              <div className="row gx-1">
                <div className="col-2 d-flex">
                  <div className="pt-1 ms-1">
                    <InfoIcon></InfoIcon>
                  </div>
                </div>
                <div className="col-10 d-flex align-self-center">
                  {!props.dataIsLoaded && <div>{t('node-info.loading')}</div>}
                  {props.dataIsLoaded && (
                    <div>{t('node-info.select-a-node')}</div>
                  )}
                </div>
              </div>
            </>
          )}
          {dropDownList.length > 1 && (
            <DropdownWrapper>
              <Dropdown
                labelText={t('schema-tree.dropdown-label')}
                labelMode={'hidden'}
                className="mt-2"
                visualPlaceholder={t('schema-tree.dropdown-placeholder')}
                value={selectedNode?.id ?? ''}
                onChange={(newValue) => handleDropDownSelect(newValue)}
              >
                {dropDownList.map((rt) => (
                  <DropdownItem key={rt?.visualTreeId} value={rt?.id}>
                    {rt?.name}
                  </DropdownItem>
                ))}
              </Dropdown>
            </DropdownWrapper>
          )}
          {props.isNodeEditable &&
            selectedNode &&
            !isLeafNode &&
            !props.hasCustomRoot && (
              <Button
                variant="secondary"
                className="mb-1"
                onClick={() => setAsRootNode(selectedNode)}
              >
                {t('node-info.set-as-root-node')}
              </Button>
            )}
          {props.isNodeEditable && props.hasCustomRoot && (
            <Button
              variant="secondary"
              className="mb-1"
              onClick={() => setAsRootNode(undefined)}
            >
              {t('node-info.reset-custom-root-node')}
            </Button>
          )}
          <div>
            <div className="row">
              {props.treeData.length > 1 && (
                <>
                  <div className="col-12">
                    <div>{t('schema-tree.selected-node')}</div>
                    <div className="attribute-font">{selectedNode?.name}</div>
                  </div>
                </>
              )}

              {nodeAttributes.map((attrib) => (
                <RenderAttribute key={self.crypto.randomUUID()} attribute={attrib} />
              ))}
              {props.isNodeEditable &&
                isLeafNode &&
                nodeTypeAttribute !== '' && (
                  <div className='col-12' key={self.crypto.randomUUID()}>
                    <div>@type:</div>
                    <div className="attribute-font">
                      {processHtmlLinks(nodeTypeAttribute)}
                    </div>
                    <TypeSelector nodeId={selectedNode?.id} />
                  </div>
                )}
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
}
