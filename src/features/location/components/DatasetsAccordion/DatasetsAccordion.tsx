import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Color, ColorPicker, useColor } from 'react-color-palette';
import { CustomPopup } from '../../../../components/CustomPopup/CustomPopup';
import { DualRangeSlider } from '../../../../components/DualRangeSlider/DualRangeSlider';
import { Switch } from '../../../../components/Switch/Switch';
import SwitchButton from '../../../../components/SwitchButton/SwitchButton';
import RangeInput from '../../../../components/RangeInput/RangeInput';
import ItemMenu from './ItemMenu';

import styles from '../accordion/Accordion.module.css';
import DatasetStyles from './DatasetsAccordion.module.css';
import { DataSetList, updateDataset } from '../../../planSimulation/components/SimulationMapView/api/datasetsAPI';
import { usePolygonContext } from '../../../../contexts/PolygonContext';
interface DatasetsAccordionProps {
  open?: boolean;
  dataset: DataSetList;
  updateDatasetHandler: (datasetId: string) => void;
  removeDatasetHandler: (datasetId: string) => void;
}

function DatasetsAccordion({
  open = false,
  dataset,
  updateDatasetHandler,
  removeDatasetHandler
}: DatasetsAccordionProps) {
  const [range, setRange] = useState({ min: dataset.filter?.minValue, max: dataset.filter?.maxValue });
  const [currentRange, setCurrentRange] = useState({
    min: dataset.selectedRange?.minValue,
    max: dataset.selectedRange?.minValue
  });

  const [isOpen, setOpen] = useState(open);
  const [showModal, setShowModal] = useState(false);

  const [customColor, setCustomColor] = useColor('hex', dataset.hexColor);
  // SLIDER
  const [opacitySliderValue, setOpacitySliderValue] = useState(100);

  const [borderColor, setBorderColor] = useColor('hex', '#00FF00');
  const [borderValue, setBorderValue] = useState(dataset.lineWidth);

  const [checked, setChecked] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [edit, setEdit] = useState(false);

  const [datasetName, setDatasetName] = useState(dataset.name);
  const [tempName, setTempName] = useState(dataset.name);

  const colorPickerRef = useRef<HTMLDivElement>(null);

  const { dispatch } = usePolygonContext();
  const { state } = usePolygonContext();

  const handleColorPopup = (event: any) => {
    event.stopPropagation();
    setShowModal(!showModal);
  };

  const handleRangeChange = (minValue: number, maxValue: number) => {
    setCurrentRange({ min: minValue, max: maxValue });
    dispatch({
      type: 'UPDATE_DATASET_FILTER',
      payload: {
        datasetId: dataset.identifier,
        filter: {
          minValue,
          maxValue
        }
      }
    });
  };

  const handleDatasetUpdate = async () => {
    try {
      const UpdatedSimulation = await updateDataset({
        simulationId: state.simulationId,
        datasetId: dataset.identifier,
        name: tempName,
        hexColor: customColor.hex,
        lineWidth: borderValue
      });
      updateDatasetHandler(UpdatedSimulation.datasets);
    } catch (error) {
      console.error('Failed to update dataset:', error);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setTempName(datasetName); // Revert to the committed value
      setEdit(false); // Exit edit mode
    } else if (event.key === 'Enter') {
      setDatasetName(tempName); // Commit the new value
      handleDatasetUpdate(); // Call the API to update the dataset
      setEdit(false); // Exit edit mode
    }
  };

  const removeDataset = async () => {
    try {
      removeDatasetHandler(dataset.identifier);
    } catch (error) {
      console.error('Failed to delete dataset:', error);
    }
  };

  const handleChecked = () => {
    setChecked(!checked);
    setCurrentRange(range);
    dispatch({
      type: 'UPDATE_DATASET_FILTER',
      payload: {
        datasetId: dataset.identifier,
        filter: {
          minValue: range.min,
          maxValue: range.max
        }
      }
    });
  };

  const handleDatasetSliderValue = (newOpacity: number) => {
    setOpacitySliderValue(newOpacity);

    console.log(newOpacity);

    dispatch({
      type: 'UPDATE_DATASET_OPACITY',
      payload: {
        [dataset.identifier]: newOpacity
      }
    });
  };

  useEffect(() => {
    setIsVisible(dataset.hidden);
    setRange({ min: dataset.filter?.minValue, max: dataset.filter?.maxValue });
    setCurrentRange({ min: dataset.selectedRange?.minValue, max: dataset.selectedRange?.maxValue });
  }, [dataset]);

  return (
    <div className={`${styles.accordion_Wrapper}`}>
      <div
        className={`${styles.accordion_dataset} ${isOpen ? styles.open : ''}`}
        onClick={() => setOpen(!isOpen)}
        style={{ position: 'relative' }}
      >
        <div
          ref={colorPickerRef}
          onClick={handleColorPopup}
          className={styles.colorBox}
          style={{ backgroundColor: `${customColor.hex}` }}
        ></div>
        <ItemMenu
          direction="left"
          isVisible={isVisible}
          onToggleVisibility={() =>
            dispatch({
              type: 'TOGGLE_DATASET_VISIBILITY',
              payload: {
                ...dataset,
                hidden: !isVisible
              }
            })
          }
          onEdit={() => {
            setEdit(!edit);
          }}
          onDelete={() => {
            removeDataset();
          }}
        />
        <CustomPopup
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            handleDatasetUpdate();
          }}
          referenceElement={colorPickerRef.current}
          hasBackdrop={false}
        >
          <div className={DatasetStyles.popupWrapper}>
            <Switch
              leftOption="Polygon"
              rightOption="Border"
              leftContent={
                <div className={DatasetStyles.switchPanel}>
                  <RangeInput
                    min={0}
                    max={100}
                    value={opacitySliderValue}
                    onChange={handleDatasetSliderValue}
                    label="Opacity"
                    trackColor={customColor.hex}
                    thumbColor={customColor.hex}
                  />
                  <ColorPicker
                    width={210}
                    height={228}
                    color={customColor}
                    onChange={setCustomColor}
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
                    value={borderValue}
                    step={1}
                    onChange={setBorderValue}
                    label="Line Width"
                    trackColor={borderColor.hex}
                    thumbColor={borderColor.hex}
                  />
                  <ColorPicker
                    width={210}
                    height={228}
                    color={borderColor}
                    onChange={setBorderColor}
                    hideHEX={true}
                    hideHSV={true}
                    hideRGB={true}
                  />
                </div>
              }
            />
          </div>
        </CustomPopup>

        {edit ? (
          <input
            type="text"
            className={DatasetStyles.datasetInput}
            value={tempName}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={DatasetStyles.datasetNameLabel}>{datasetName}</span>
        )}
        <FontAwesomeIcon
          style={{ width: '0.9rem', height: '0.9rem' }}
          className={styles.icon}
          icon={isOpen ? 'chevron-down' : 'chevron-right'}
        />
      </div>
      <div className={`${styles.accordion_item} ${!isOpen ? `${styles.collapsed}` : ''}`}>
        <div className={`${styles.accordion_content}`}>
          <div className={DatasetStyles.rangeSwitchPicker}>
            <SwitchButton
              id={dataset.name}
              isOn={checked}
              title={'Filter'}
              handleToggle={handleChecked}
              colorOne={dataset.hexColor && customColor.hex}
            />
            <DualRangeSlider
              min={range.min}
              max={range.max}
              defaultMinValue={currentRange.min}
              defaultMaxValue={currentRange.max}
              inactive={!checked}
              color={checked ? customColor : undefined}
              onChange={handleRangeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatasetsAccordion;
