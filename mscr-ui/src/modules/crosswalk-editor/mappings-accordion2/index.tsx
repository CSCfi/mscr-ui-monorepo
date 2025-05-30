import * as React from 'react';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';

import { Button as Sbutton, Paragraph, SearchInput, Text } from 'suomifi-ui-components';
import Tooltip from '@mui/material/Tooltip';
import {
  MappingNodeSummary,
  NodeMapping,
  RenderTree,
} from '@app/common/interfaces/crosswalk-connection.interface';
import LinkIcon, { InfoIcon } from '@app/common/components/shared-icons';
import { useTranslation } from 'next-i18next';
import { Format } from '@app/common/interfaces/format.interface';
import { SchemaWithContent } from '@app/common/interfaces/schema.interface';
import {
  CrosswalkWithVersionInfo,
  SubType,
} from '@app/common/interfaces/crosswalk.interface';
import { State } from '@app/common/interfaces/state.interface';
import {
  MappingListWrapper,
  MappingsHeading,
} from '@app/modules/crosswalk-editor/mappings-accordion2/mappings-accordion2.styles';
import MappingCard from '@app/modules/crosswalk-editor/mappings-accordion2/mapping-card';

function extractPath(strings: string[]): string {
  let returnString = '';
  for (let i = 0; i < strings.length; i++) {
    if (strings.length === i - 1) {
      returnString = returnString + '/' + strings[i];
    } else {
      let separator = '/';
      if (i === 0) {
        separator = '';
      }
      if (i === strings.length - 2 || i === strings.length - 3 && strings.length > 3) {
        separator = '/ ';
      }
      if (i % 2 === 0) {
        returnString = returnString + separator + strings[i];
      }
    }
  }
  return returnString;
}

function returnFullPath(id: string) : string {
  let returnString = id.substring(id?.indexOf('#root-Root-') + '#root-Root-'.length);
  let strings;
  if (returnString) {
    strings = returnString.split('-');
    returnString = '';
    if (strings.length > 1) {
      returnString = extractPath(strings);
    } else {
      returnString = strings[0];
    }
  }
  return returnString;
}

function returnPath(id: string, label: string, schemaFormat: Format | undefined, schemaData: SchemaWithContent | undefined) : string {
  let returnString = '';
  if (schemaFormat === Format.Xsd || schemaFormat === Format.Jsonschema
  || schemaFormat === Format.Enum || schemaFormat === Format.Mscr) {
    returnString = id.substring(id?.indexOf('#root-Root-') + '#root-Root-'.length);
    let strings;
    if (returnString) {
      strings = returnString.split('-');
      returnString = '';
      if (strings.length > 7) {
        returnString = strings[0] + '/{' + (strings.length - 5) / 2 + '}/' + strings[strings.length - 2] + '/ ' + strings[strings.length - 1];
      } else if (strings.length > 1) {
        returnString = extractPath(strings);
      } else {
        returnString = strings[0];
      }
    }
    return returnString;

  } else if (schemaFormat === Format.Shacl) {
    const definitions = schemaData?.content?.definitions;
    let titleValue = undefined;
    if (definitions) {
      const keys = Object.keys(definitions);
      if (keys && keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
          const value = definitions[keys[i]];
          const secondLevelKeys = Object.keys(value);
          for (let k = 0; k < secondLevelKeys.length; k += 1) {
            if (secondLevelKeys[k] === 'properties') {
              const secondLevelValue = value[secondLevelKeys[k]];
              const thirdLevelKeys = Object.keys(secondLevelValue);
              for (let j = 0; j < thirdLevelKeys.length; j += 1) {
                if (thirdLevelKeys[j] === id) {
                  for (let l = 0; l < secondLevelKeys.length; l += 1) {
                    if (secondLevelKeys[l] === 'title') {
                      titleValue = value[secondLevelKeys[l]];
                      returnString = titleValue + ':' + label;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if (!titleValue && label && label.toLowerCase() === 'root') {
      return label;
    } else if (!titleValue && label && label.toLowerCase() !== 'root') {
      return 'ROOT:' + label;
    }
    return returnString;
  } else {
    return label;
  }
}

function filterMappings(nodeMappingsInput: NodeMapping[], value: string, showAttributeNames: boolean) {
  const results: NodeMapping[] = [];
  const searchString = value.toLowerCase();
  nodeMappingsInput.forEach(item => {
      let itemFound = false;
      if (item?.notes && item.notes.toLowerCase().includes(searchString) && !itemFound) {
        results.push(item);
        itemFound = true;
      }
      if (!itemFound) {
        item.source.forEach(src => {
          if (src.label.toLowerCase().includes(searchString) && !itemFound) {
            results.push(item);
            itemFound = true;
          }
        });
      }
      if (!itemFound) {
        item.target.forEach(src => {
          if (src.label.toLowerCase().includes(searchString) && !itemFound) {
            results.push(item);
            itemFound = true;
          }
        });
      }
    }
  );
  return results;
}

export default function MappingsAccordion2({nodeMappings, viewOnlyMode, isEditModeActive, showAttributeNames,
                                            mappingFunctions, performAccordionAction, schemaFormats, schemaDatas, setNodeMappingsModalOpen,
                                           selectedSourceNodes, selectedTargetNodes, addMappingButtonClick, hasEditPermission, crosswalkData}
                                            :
{nodeMappings: NodeMapping[];
  viewOnlyMode: boolean;
  isEditModeActive: boolean;
  showAttributeNames: boolean;
  mappingFunctions: any;
  performAccordionAction: Function;
  schemaFormats: {sourceSchemaFormat: Format | undefined; targetSchemaFormat: Format | undefined};
  schemaDatas: {sourceSchemaData: SchemaWithContent | undefined; targetSchemaData: SchemaWithContent | undefined };
  setNodeMappingsModalOpen:  Dispatch<SetStateAction<boolean>>;
  selectedSourceNodes: RenderTree[];
  selectedTargetNodes: RenderTree[];
  addMappingButtonClick: Function;
  hasEditPermission: boolean;
  crosswalkData: CrosswalkWithVersionInfo;
}) {
  const {t} = useTranslation('common');
  const [mappingData, setMappingData] = React.useState<NodeMapping[]>([]);

  useEffect(() => {
    setMappingData(nodeMappings);
  }, [nodeMappings]);

  useEffect(() => {
    setMappingData([]);
  }, []);

  const mappingCardData = useMemo(() => {
    return nodeMappings.map((orig) => {
      const getOriginalFunction = (id?: string) => mappingFunctions.find((fnc: {uri: string}) => id && fnc.uri === id);
      function formatNode(node: MappingNodeSummary, isSource: boolean) {
        const onClick = () => performAccordionAction(
          orig,
          'selectFromTreesByMapping',
          node.id,
          '',
          isSource
        );
        const baseNode = {
          id: node.id,
          label: returnPath(node.id, node.label, schemaFormats?.sourceSchemaFormat, schemaDatas?.sourceSchemaData),
          fullPath: returnFullPath(node.id),
          onClickNode: onClick,
        };
        if (node.processing && node.processing.id) {
          return {
            ...baseNode,
            processing: {
              id: node.processing?.id,
              name: getOriginalFunction(node.processing?.id).name,
              params: node.processing?.params
            }
          };
        } else {
          return baseNode;
        }
      }
      const baseData = {
        id: orig.id,
        source: orig.source.map((sourceNode) => formatNode(sourceNode, true)),
        target: orig.target.map((targetNode) => formatNode(targetNode, false)),
        onClickEdit: () => {
          setNodeMappingsModalOpen(true);
          performAccordionAction(orig, 'openMappingDetails');
        },
        onDelete: () => performAccordionAction(orig, 'removeMapping')
      };
      if (orig.predicate && [SubType.SemanticMapping, SubType.SemanticAnnotation].includes(crosswalkData.subType)) {
        return {
          ...baseData,
          predicate: orig.predicate
        };
      } else if (orig.processing && crosswalkData.subType === SubType.DataCrosswalk) {
        return {
          ...baseData,
          processing: {
            ...orig.processing,
            name: getOriginalFunction(orig.processing?.id).name
          }
        };
      }
      return baseData;
    });
  }, [
    crosswalkData.subType,
    mappingFunctions,
    nodeMappings,
    performAccordionAction,
    schemaDatas?.sourceSchemaData,
    schemaFormats?.sourceSchemaFormat,
    setNodeMappingsModalOpen,
    showAttributeNames
  ]) ;

  const nodeMappingsInput = mappingData;
  return (
    <>
      <div
        className="d-flex justify-content-between ps-1"
        style={{ maxHeight: '600px' }}
      >
        <MappingsHeading variant="h2">{t('mappings-accordion.title')}</MappingsHeading>
        <SearchInput
          labelText={''}
          labelMode="hidden"
          searchButtonLabel={t('mappings-accordion.filter-from-mappings')}
          clearButtonLabel={t('mappings-accordion.clear')}
          visualPlaceholder={t('mappings-accordion.filter-from-mappings')}
          onSearch={(value) => {
            if (typeof value === 'string') {
              setMappingData(
                filterMappings(nodeMappingsInput, value, showAttributeNames)
              );
            }
          }}
          onChange={(value) => {
            if (!value) {
              setMappingData(nodeMappings);
            }
          }}
        />
      </div>
      <MappingListWrapper>
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
              style={{ width: '200px', height: '60px' }}
            >
              <div>
                <LinkIcon></LinkIcon> Create Mapping
              </div>
            </Sbutton>
          </Tooltip>
        )}
        {mappingData?.length > 0 && mappingCardData.map((mapping) => (
          <MappingCard
            key={mapping.id ?? self.crypto.randomUUID()}
            mapping={mapping}
            isEditable={hasEditPermission && isEditModeActive}
          />
        ))}
        {!mappingData || mappingData.length === 0 && (
          <>
            <InfoIcon></InfoIcon>
            <Text>{t('mappings-accordion.no-mappings')}</Text>
          </>
        )}
      </MappingListWrapper>
    </>
  );
}
