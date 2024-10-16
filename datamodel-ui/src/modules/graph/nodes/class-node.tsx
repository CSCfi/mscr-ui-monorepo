/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  resetHighlighted,
  resetHovered,
  selectDisplayLang,
  selectHovered,
  selectModelTools,
  selectSelected,
  setHighlighted,
  setHovered,
  setSelected,
} from '@app/common/components/model/model.slice';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Handle, Position, useReactFlow } from 'reactflow';
import {
  IconChevronDown,
  IconChevronUp,
  IconOptionsVertical,
  IconRows,
  IconSwapVertical,
  Tooltip,
} from 'suomifi-ui-components';
import {
  ClassNodeDiv,
  CollapseButton,
  OptionsButton,
  Resource,
  ResourceTechnicalName,
  TooltipWrapper,
} from './node.styles';
import { useStoreDispatch } from '@app/store';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import { useTranslation } from 'next-i18next';
import { ResourceType } from '@app/common/interfaces/resource-type.interface';
import HasPermission from '@app/common/utils/has-permission';
import { useAddPropertyReferenceMutation } from '@app/common/components/class/class.slice';
import ResourceModal from '@app/modules/class-view/resource-modal';
import getConnectedElements from '../utils/get-connected-elements';
import { UriData } from '@app/common/interfaces/uri.interface';
import { ClassNodeDataType } from '@app/common/interfaces/graph.interface';

interface ClassNodeProps {
  id: string;
  data: ClassNodeDataType;
  selected: boolean;
}

export default function ClassNode({ id, data, selected }: ClassNodeProps) {
  const { i18n } = useTranslation('common');
  const hasPermission = HasPermission({
    actions: 'EDIT_CLASS',
    targetOrganization: data.organizationIds,
  });
  const dispatch = useStoreDispatch();
  const { getNodes, getEdges } = useReactFlow();
  const globalSelected = useSelector(selectSelected());
  const globalHover = useSelector(selectHovered());
  const globalShowAttributes = useSelector(selectModelTools()).showAttributes;
  const displayLang = useSelector(selectDisplayLang());
  const tools = useSelector(selectModelTools());
  const [showAttributes, setShowAttributes] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hover, setHover] = useState(false);
  const [addReference, addReferenceResult] = useAddPropertyReferenceMutation();

  const handleTitleClick = () => {
    if (globalSelected.id !== id) {
      dispatch(setSelected(id, 'classes'));
    }
  };

  const handleShowAttributesClick = () => {
    setShowAttributes(!showAttributes);
  };

  const handleHover = (hover: boolean) => {
    setHover(hover);
    if (hover) {
      dispatch(setHovered(id, 'classes'));
    } else {
      dispatch(resetHovered());
    }
  };

  const handleMenuFollowUp = (value: {
    uriData: UriData;
    type: ResourceType;
    mode: 'select' | 'create';
  }) => {
    if (!data.modelId) {
      return;
    }

    addReference({
      prefix: data.modelId,
      identifier: data.identifier,
      uri: value.uriData.uri,
      applicationProfile: true,
    });
  };

  const handleResourceClick = (
    id: string,
    type: ResourceType.ASSOCIATION | ResourceType.ATTRIBUTE
  ) => {
    dispatch(
      setSelected(
        id,
        type === ResourceType.ASSOCIATION ? 'associations' : 'attributes'
      )
    );
  };

  const handleResourceHover = (
    id: string,
    type: ResourceType.ASSOCIATION | ResourceType.ATTRIBUTE,
    hide?: boolean
  ) => {
    if (hide && type === ResourceType.ASSOCIATION) {
      dispatch(resetHighlighted());
    }

    const targetEdge = getEdges().find((edge) => edge.data.identifier === id);

    if (type === ResourceType.ASSOCIATION && targetEdge) {
      dispatch(
        setHighlighted(getConnectedElements(targetEdge, getNodes(), getEdges()))
      );
    }
  };

  useEffect(() => {
    setShowAttributes(globalShowAttributes);
  }, [globalShowAttributes]);

  useEffect(() => {
    if (showTooltip && !selected) {
      setShowTooltip(false);
    }
  }, [selected, showTooltip]);

  useEffect(() => {
    if (addReferenceResult.isSuccess && data.refetch) {
      data.refetch();
    }
  }, [addReferenceResult, data]);

  return (
    <ClassNodeDiv
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      $highlight={
        globalSelected.type === 'classes' &&
        globalSelected.id !== '' &&
        globalSelected.id === id
      }
      $hover={hover || globalHover.id === id}
      $appProfile={data.applicationProfile}
    >
      <Handle type="target" position={Position.Top} id={id} />
      <Handle type="source" position={Position.Bottom} id={id} />

      <div className="node-title">
        <div onClick={() => handleTitleClick()}>{renderClassLabel()}</div>

        {data.applicationProfile ? (
          hasPermission ? (
            <TooltipWrapper>
              <OptionsButton
                onClick={() => setShowTooltip(!showTooltip)}
                id={`${data.identifier}-options`}
              >
                <IconOptionsVertical fill="#2a6ebb" />
              </OptionsButton>

              <Tooltip
                ariaCloseButtonLabelText=""
                ariaToggleButtonLabelText=""
                open={showTooltip}
              >
                <ResourceModal
                  modelId={'profile1'}
                  type={ResourceType.ATTRIBUTE}
                  handleFollowUp={handleMenuFollowUp}
                  limitSearchTo={'PROFILE'}
                  buttonIcon
                  limitToSelect
                />

                <ResourceModal
                  modelId={'profile1'}
                  type={ResourceType.ASSOCIATION}
                  handleFollowUp={handleMenuFollowUp}
                  limitSearchTo={'PROFILE'}
                  buttonIcon
                  limitToSelect
                />
              </Tooltip>
            </TooltipWrapper>
          ) : (
            <></>
          )
        ) : (
          <CollapseButton onClick={() => handleShowAttributesClick()}>
            {showAttributes ? <IconChevronUp /> : <IconChevronDown />}
          </CollapseButton>
        )}
      </div>

      {showAttributes &&
        data.resources &&
        data.resources
          .filter((r) => {
            if (
              r.type === ResourceType.ATTRIBUTE &&
              ((data.applicationProfile && tools.showAttributeRestrictions) ||
                (!data.applicationProfile && tools.showAttributes))
            ) {
              return true;
            }

            if (
              r.type === ResourceType.ASSOCIATION &&
              ((data.applicationProfile && tools.showAssociationRestrictions) ||
                (!data.applicationProfile && tools.showAssociations))
            ) {
              return true;
            }

            return false;
          })
          .map((r) => (
            <Resource
              key={`${id}-child-${r.identifier}`}
              className="node-resource"
              onClick={() => handleResourceClick(r.identifier, r.type)}
              $highlight={getResourceHighlighted(r.identifier, r.type)}
              onMouseEnter={() => handleResourceHover(r.identifier, r.type)}
              onMouseLeave={() =>
                handleResourceHover(r.identifier, r.type, true)
              }
            >
              {data.applicationProfile &&
                (r.type === ResourceType.ASSOCIATION ? (
                  <IconSwapVertical />
                ) : (
                  <IconRows />
                ))}

              {renderResourceLabel(r)}
            </Resource>
          ))}
    </ClassNodeDiv>
  );

  function getResourceHighlighted(
    id: string,
    type: ResourceType.ASSOCIATION | ResourceType.ATTRIBUTE
  ) {
    if (
      (globalHover.id === id || globalSelected.id === id) &&
      type === ResourceType.ASSOCIATION &&
      (globalHover.type === 'associations' ||
        globalSelected.type === 'associations')
    ) {
      return true;
    }

    if (
      (globalHover.id === id || globalSelected.id === id) &&
      type === ResourceType.ATTRIBUTE &&
      (globalHover.type === 'attributes' ||
        globalSelected.type === 'attributes')
    ) {
      return true;
    }

    return false;
  }

  function renderClassLabel() {
    if (tools.showById) {
      return `${data.modelId}:${data.identifier}`;
    }

    if (!data.applicationProfile) {
      return getLanguageVersion({
        data: data.label,
        lang: displayLang !== i18n.language ? displayLang : i18n.language,
        appendLocale: true,
      });
    }

    return data.identifier.includes(':')
      ? data.identifier
      : `${getLanguageVersion({
          data: data.label,
          lang: displayLang !== i18n.language ? displayLang : i18n.language,
          appendLocale: true,
        })}
            ${' '}
        (${data.modelId}:${data.identifier})`;
  }

  function renderResourceLabel(
    resource: ClassNodeProps['data']['resources'][0]
  ) {
    if (tools.showById) {
      return (
        <>
          {[getMinMax(resource)]} {getIdentifier(resource)}
        </>
      );
    }

    if (!data.applicationProfile) {
      return getLanguageVersion({
        data: resource.label,
        lang: displayLang !== i18n.language ? displayLang : i18n.language,
        appendLocale: true,
      });
    }

    return (
      <div>
        {getLanguageVersion({
          data: resource.label,
          lang: displayLang !== i18n.language ? displayLang : i18n.language,
          appendLocale: true,
        })}
        : [{getMinMax(resource)}] {getIdentifier(resource)}
      </div>
    );
  }

  function getMinMax(resource: ClassNodeProps['data']['resources'][0]) {
    if (!resource.minCount && !resource.maxCount) {
      return '*';
    }

    return `${resource.minCount ?? '0'}..${resource.maxCount ?? '*'}`;
  }

  function getIdentifier(resource: ClassNodeProps['data']['resources'][0]) {
    return (
      <ResourceTechnicalName>
        ({data.identifier}:{resource.identifier})
      </ResourceTechnicalName>
    );
  }
}
