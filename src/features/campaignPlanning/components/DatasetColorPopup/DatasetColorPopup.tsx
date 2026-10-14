import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useColor } from 'react-color-palette';
import DatasetStyleEditor from '../../../location/components/DatasetsAccordion/DatasetStyleEditor';
import { SimulationDataset } from '../../providers/types';
import styles from './DatasetColorPopup.module.css';

// Gap between the left panel and the card, and from the window edges
const PANEL_GAP = 10;
const EDGE_GAP = 12;

interface Props {
  dataset: SimulationDataset;
  // Colour the dataset is drawn in (its own, or the list fallback)
  color: string;
  // Dataset row the card opens level with (to the right of the panel holding it, marked data-popup-edge)
  anchor: HTMLElement | null;
  // The colour button that opened it: its clicks are left to the row, which closes the card through the handle below
  trigger: HTMLElement | null;
  onClose: () => void;
  onSave: (dataset: SimulationDataset) => void;
}

// Simulation's colour panel (polygon colour + opacity, border colour + line width), opened by clicking the dataset's
// colour. Like Simulation it opens beside the dataset and saves when it closes (click outside or Esc).
// Its own positioning instead of Simulation's CustomPopup, which only keeps the card on screen on the Simulation map.
// Lets the row close it (with saving) when its colour is clicked again, like Simulation's colour box
export interface DatasetColorPopupHandle {
  close: () => void;
}

const DatasetColorPopup = forwardRef<DatasetColorPopupHandle, Props>(
  ({ dataset, color, anchor, trigger, onClose, onSave }, ref) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number }>();
    const [fillColor, setFillColor] = useColor('hex', color);
    const [opacity, setOpacity] = useState(dataset.opacity ?? 100);
    const [borderColor, setBorderColor] = useColor('hex', dataset.borderColor || '#000000');
    const [lineWidth, setLineWidth] = useState(dataset.lineWidth ?? 1);

    // Just right of the left panel, level with the row, moved up when it would run past the bottom of the window.
    // Measured from the panel, not the row: the row gets narrower when the panel shows a scrollbar (open hierarchy).
    useLayoutEffect(() => {
      const place = () => {
        if (!anchor || !popupRef.current) return;
        const { top } = anchor.getBoundingClientRect();
        const { right } = (anchor.closest('[data-popup-edge]') ?? anchor).getBoundingClientRect();
        const maxTop = window.innerHeight - popupRef.current.offsetHeight - EDGE_GAP;
        setPosition({ left: right + PANEL_GAP, top: Math.max(EDGE_GAP, Math.min(top - EDGE_GAP, maxTop)) });
      };
      place();
      window.addEventListener('resize', place);
      return () => window.removeEventListener('resize', place);
    }, [anchor]);

    const handleClose = () => {
      onClose();
      const isChanged =
        fillColor.hex !== color ||
        borderColor.hex !== (dataset.borderColor || '#000000') ||
        lineWidth !== (dataset.lineWidth ?? 1) ||
        opacity !== (dataset.opacity ?? 100);
      if (isChanged) {
        onSave({ ...dataset, hexColor: fillColor.hex, borderColor: borderColor.hex, lineWidth, opacity });
      }
    };
    // The listeners below are added once per open, so they read the latest edits through this ref
    const closeRef = useRef(handleClose);
    closeRef.current = handleClose;
    useImperativeHandle(ref, () => ({ close: () => closeRef.current() }), []);

    useEffect(() => {
      const handleMouseDown = (event: MouseEvent) => {
        const target = event.target as Node;
        if (!popupRef.current?.contains(target) && !trigger?.contains(target)) closeRef.current();
      };
      const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && closeRef.current();
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [trigger]);

    return createPortal(
      <div
        ref={popupRef}
        className={styles.popup}
        role="dialog"
        aria-label={dataset.name}
        style={position ?? { visibility: 'hidden' }}
      >
        <DatasetStyleEditor
          color={fillColor}
          onColorChange={setFillColor}
          opacity={opacity}
          onOpacityChange={setOpacity}
          borderColor={borderColor}
          onBorderColorChange={setBorderColor}
          lineWidth={lineWidth}
          onLineWidthChange={setLineWidth}
        />
      </div>,
      document.body
    );
  }
);

export default DatasetColorPopup;
