import {
  ParamList,
  MappingWrapper,
  NodeItem,
  NodeList,
  FunctionDisplay,
  MappingSubheading,
  NodeButton,
  FunctionLabel,
  ActionButton,
} from '@app/modules/crosswalk-editor/mappings-accordion2/mapping-card/mapping-card.styles';
import { useTranslation } from 'next-i18next';
import { StyledButton } from '@app/modules/crosswalk-editor/mappings-accordion/mappings-accordion.styles';
import { Button } from 'suomifi-ui-components';
import { useState } from 'react';
import ConfirmModal from '@app/common/components/confirmation-modal';
import * as React from 'react';

interface MappingNodeDisplay {
  id: string;
  label: string;
  fullPath: string;
  processing?: {
    id: string;
    name: string;
    params: {
      [s: string]: string;
    };
  };
  onClickNode: () => void;
}

export interface MappingCardInterface {
  source: MappingNodeDisplay[];
  target: MappingNodeDisplay[];
  processing?: {
    id: string;
    name: string;
    params: {
      [s: string]: string;
    };
  };
  predicate?: string;
  onClickEdit: () => void;
  onDelete: () => void;
}

export default function MappingCard({
  mapping,
  isEditable,
}: {
  mapping: MappingCardInterface;
  isEditable: boolean;
}) {
  const { t } = useTranslation('common');
  const [isDeleteMappingModalOpen, setIsDeleteMappingModalOpen] =
    useState(false);
  function handleDelete() {
    setIsDeleteMappingModalOpen(false);
    mapping.onDelete();
  }

  function renderNodes(nodes: MappingNodeDisplay[]) {
    return (
      <NodeList>
        {nodes.map((node) => (
          <NodeItem key={node.id}>
            <NodeButton
              title={node.fullPath}
              onClick={(e) => {
                node.onClickNode();
                e.stopPropagation();
              }}
            >
              {node.label}
            </NodeButton>
            <br />
            {node.processing && renderFunctionAndParams(node.processing)}
          </NodeItem>
        ))}
      </NodeList>
    );
  }

  function renderFunctionAndParams(f: { name: string; params: Object }) {
    const paramDisplay: string[] = [];
    for (const [key, value] of Object.entries(f.params)) {
      if (key !== 'input') {
        paramDisplay.push(`${key}: ${value}`);
      }
    }
    return (
      <FunctionDisplay>
        <FunctionLabel>{t('mappings-accordion.function')}: </FunctionLabel>
        {f.name}{' '}
        {paramDisplay.length > 0 && (
          <>
            <FunctionLabel>{t('mappings-accordion.params')}:</FunctionLabel>
            <ParamList>
              {paramDisplay.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ParamList>
          </>
        )}
      </FunctionDisplay>
    );
  }

  return (
    <>
      <MappingWrapper>
        <MappingSubheading variant={'h3'}>
          {t('mappings-accordion.from')}:
        </MappingSubheading>
        {renderNodes(mapping.source)}
        {mapping.predicate && (
          <>
            <MappingSubheading variant={'h3'}>
              {t('mappings-accordion.predicate')}:
            </MappingSubheading>
          </>
        )}
        {mapping.processing && (
          <>
            <MappingSubheading variant={'h3'}>
              {t('mappings-accordion.mapping-function')}:
            </MappingSubheading>
            {renderFunctionAndParams(mapping.processing)}
          </>
        )}
        <MappingSubheading variant={'h3'}>
          {t('mappings-accordion.to')}:
        </MappingSubheading>
        {renderNodes(mapping.target)}
        <ActionButton onClick={mapping.onClickEdit} disabled={!isEditable}>
          {t('edit')}
        </ActionButton>
        <ActionButton
          onClick={() => setIsDeleteMappingModalOpen(true)}
          disabled={!isEditable}
        >
          {t('delete')}
        </ActionButton>
      </MappingWrapper>
      {isDeleteMappingModalOpen && (
        <ConfirmModal
          heading={t('confirm-modal.heading')}
          actionText={t('confirm')}
          cancelText={t('cancel')}
          confirmAction={() => handleDelete()}
          onClose={() => {
            setIsDeleteMappingModalOpen(false);
          }}
          text1={t('confirm-modal.do-you-want-to-delete-mapping')}
        />
      )}
    </>
  );
}
