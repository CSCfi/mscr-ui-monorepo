/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  resetHovered,
  selectDisplayLang,
  selectHovered,
  selectSelected,
  setHovered,
  setSelected,
} from '@app/common/components/model/model.slice';
import { MouseEvent, useCallback } from 'react';
import {
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
  useStore,
} from 'reactflow';
import { EdgeContent, HoveredPath } from './edge.styles';
import { useSelector } from 'react-redux';
import { useStoreDispatch } from '@app/store';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import { useTranslation } from 'next-i18next';
import getEdgeParams from '../utils/get-edge-params';

export default function SolidEdge({
  id,
  data,
  source,
  target,
  markerEnd,
  style,
}: EdgeProps) {
  const { i18n } = useTranslation('common');
  const dispatch = useStoreDispatch();
  const globalSelected = useSelector(selectSelected());
  const displayLang = useSelector(selectDisplayLang());
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target])
  );

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  const handleHover = (value?: boolean) => {
    if (value) {
      dispatch(setHovered(data.identifier, 'associations'));
      return;
    }

    dispatch(resetHovered());
  };

  return (
    <>
      <HoveredPath
        d={edgePath}
        onMouseOver={() => handleHover(true)}
        onMouseLeave={() => handleHover()}
      />

      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
        onMouseOver={() => handleHover(true)}
      />

      <EdgeLabelRenderer>
        <EdgeContent
          className="nopan"
          $labelX={labelX}
          $labelY={labelY}
          $highlight={
            globalSelected.type === 'associations' &&
            globalSelected.id === data.identifier
          }
        >
          <div>
            {getLanguageVersion({
              data: data.label,
              lang: displayLang !== i18n.language ? displayLang : i18n.language,
              appendLocale: true,
            })}
          </div>
        </EdgeContent>
      </EdgeLabelRenderer>
    </>
  );
}
