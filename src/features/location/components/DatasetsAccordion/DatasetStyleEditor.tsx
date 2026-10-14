import { Color, ColorPicker } from 'react-color-palette';
import { Switch } from '../../../../components/Switch/Switch';
import RangeInput from '../../../../components/RangeInput/RangeInput';
import DatasetStyles from './DatasetsAccordion.module.css';

interface DatasetStyleEditorProps {
  color: Color;
  onColorChange: (color: Color) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  borderColor: Color;
  onBorderColorChange: (color: Color) => void;
  lineWidth: number;
  onLineWidthChange: (lineWidth: number) => void;
}

// Edit dataset popup content: polygon colour + opacity, and border colour + line width (Simulation and Campaign Planning)
function DatasetStyleEditor({
  color,
  onColorChange,
  opacity,
  onOpacityChange,
  borderColor,
  onBorderColorChange,
  lineWidth,
  onLineWidthChange
}: DatasetStyleEditorProps) {
  return (
    <div className={DatasetStyles.popupWrapper}>
      <Switch
        leftOption="Polygon"
        rightOption="Border"
        leftContent={
          <div className={DatasetStyles.switchPanel}>
            <RangeInput
              min={0}
              max={100}
              value={opacity}
              onChange={onOpacityChange}
              label="Opacity"
              trackColor={color.hex}
              thumbColor={color.hex}
            />
            <ColorPicker
              width={210}
              height={228}
              color={color}
              onChange={onColorChange}
              hideHEX={true}
              hideHSV={true}
              hideRGB={true}
            />
          </div>
        }
        rightContent={
          <div className={DatasetStyles.switchPanel}>
            <RangeInput
              min={0}
              max={5}
              value={lineWidth}
              step={1}
              onChange={onLineWidthChange}
              label="Line Width"
              trackColor={borderColor.hex}
              thumbColor={borderColor.hex}
            />
            <ColorPicker
              width={210}
              height={228}
              color={borderColor}
              onChange={onBorderColorChange}
              hideHEX={true}
              hideHSV={true}
              hideRGB={true}
            />
          </div>
        }
      />
    </div>
  );
}

export default DatasetStyleEditor;
