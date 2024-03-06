import { RenderTree } from '@app/common/interfaces/crosswalk-connection.interface';
import { Dropdown, DropdownItem } from 'suomifi-ui-components';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { InfoIcon } from '@app/common/components/shared-icons';

export default function NodeInfo(props: {
  treeData: RenderTree[];
  // performNodeInfoAction: any;
}) {
  let sourceSelectionInit = '';

  useEffect(() => {
    if (props.treeData && props.treeData.length > 0) {
      sourceSelectionInit = props.treeData[0].id;
      setDropdownValue(props.treeData[0].id);
      // console.log('props.sourceData');
    }
  }, [props]);

  const [sourceDropdownValue, setDropdownValue] =
    useState(sourceSelectionInit);
  const [selectedNode] = props.treeData.filter(
    (item) => item.id === sourceDropdownValue,
  );

  let dropdownInit: any = [
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
  if (props.treeData.length > 0 && props.treeData[0]?.properties) {
    for (const [key, value] of Object.entries(
      props.treeData[0]?.properties,
    )) {
      nodeProperties.push({
        name: key,
        value: typeof value === 'string' ? value.toString() : undefined,
      });
    }
  }

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
      <h2>Selected node info</h2>
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
                <div className="col-10">
                  <div>
                    Nothing to show just now. Select an entity to view
                    information.
                  </div>
                </div>
              </div>
            </>
          )}
          {props.treeData.length > 1 && (
            <div className="dropdown-wrap">
              <Dropdown
                className="mt-2 node-info-dropdown"
                visualPlaceholder="Node(s) not selected"
                value={sourceDropdownValue}
                onChange={(newValue) => setDropdownValue(newValue)}
              >
                {dropdownInit.map((rt) => (
                  <DropdownItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          )}
          <div>
            <div className="row">
              {props.treeData.length > 1 && (
                <>
                  <div className="col-12">
                    <div>Selected node:</div>
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
                </div>
              ))}
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
}
