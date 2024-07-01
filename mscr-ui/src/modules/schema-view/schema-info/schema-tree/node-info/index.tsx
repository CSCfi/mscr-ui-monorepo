import { RenderTree } from '@app/common/interfaces/crosswalk-connection.interface';
import { Dropdown, DropdownItem, ToggleButton } from 'suomifi-ui-components';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { InfoIcon } from '@app/common/components/shared-icons';
import { useTranslation } from 'next-i18next';
import { DropdownWrapper } from '@app/modules/schema-view/schema-info/schema-info.styles';
import { ToggleWrapper } from '@app/modules/schema-view/schema-info/schema-tree/node-info/node-info.styles';
import TypeSelector from '@app/modules/schema-view/schema-info/schema-tree/node-info/type-selector';

export default function NodeInfo(props: {
  treeData: RenderTree[];
  dataIsLoaded: boolean;
  isEditable?: boolean;
  // performNodeInfoAction: any;
}) {
  const { t } = useTranslation('common');
  const [selectedNode, setSelectedNode] = useState<RenderTree>();

  useEffect(() => {
    if (props.treeData && props.treeData.length > 0) {
      setSelectedNode(props.treeData[0]);
    }
  }, [props.treeData]);

  const handleDropDownSelect = (nodeId: string) => {
    const newSelectedNode = props.treeData.find((item) => item.id === nodeId);
    setSelectedNode(newSelectedNode ?? selectedNode);
  };

  let dropdownInit: { id: string; name?: string }[] = [
    {
      id: '1',
    },
  ];
  if (props.treeData && props.treeData.length > 0) {
    dropdownInit = props.treeData;
  }

  interface constantAttribute {
    name: string;
    value: string | undefined;
  }

  const nodeProperties: constantAttribute[] = [];
  if (selectedNode && selectedNode.properties) {
    for (const [key, value] of Object.entries(selectedNode.properties)) {
      nodeProperties.push({
        name: key,
        value: typeof value === 'string' ? value.toString() : undefined,
      });
    }
  }

  // Todo: Implement api call when setting root node is possible in the backend
  const handleRootToggle = (checked: boolean) => {
    console.log(t('node-info.set-as-root-node'), checked);
  };

  function processHtmlLinks(input: string | undefined) {
    if (input && input.startsWith('http://' || 'https://')) {
      return (
        <a href={input} target="_blank" rel="noreferrer">
          {input}
        </a>
      );
    }
    return input;
  }

  return (
    <div className="row d-flex justify-content-between node-info-box">
      <h3>{t('node-info.selected-node-info')}</h3>
      <div className="col flex-column d-flex justify-content-between side-bar-wrap">
        <div className="mb-2"></div>
        <Box
          className="bg-wrap"
          sx={{
            height: 440,
            flexGrow: 1,
            maxWidth: 400,
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
          {props.treeData.length > 1 && (
            <DropdownWrapper>
              <Dropdown
                labelText={t('schema-tree.dropdown-label')}
                labelMode={'hidden'}
                className="mt-2"
                visualPlaceholder={t('schema-tree.dropdown-placeholder')}
                value={selectedNode?.id ?? ''}
                onChange={(newValue) => handleDropDownSelect(newValue)}
              >
                {dropdownInit.map((rt) => (
                  <DropdownItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </DropdownItem>
                ))}
              </Dropdown>
            </DropdownWrapper>
          )}
          <div>
            {/*{props.treeData.length >= 1 && props.isEditable && (*/}
            {/*  <ToggleWrapper>*/}
            {/*    <ToggleButton*/}
            {/*      onClick={handleRootToggle}*/}
            {/*    >*/}
            {/*      {t('node-info.set-as-root-node')}*/}
            {/*    </ToggleButton>*/}
            {/*  </ToggleWrapper>*/}
            {/*)}*/}
            <div className="row">
              {props.treeData.length > 1 && (
                <>
                  <div className="col-12">
                    <div>{t('schema-tree.selected-node')}</div>
                    <div className="attribute-font">{selectedNode?.name}</div>
                  </div>
                </>
              )}

              {nodeProperties.map((attrib) => (
                <div className="col-12" key={self.crypto.randomUUID()}>
                  <div className="">{processHtmlLinks(attrib.name)}:</div>
                  <div className="attribute-font">
                    {processHtmlLinks(attrib.value)}
                  </div>
                  {props.isEditable &&
                    attrib.name === '@type' &&
                    selectedNode?.children.length === 0 && <TypeSelector />}
                </div>
              ))}
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
}
