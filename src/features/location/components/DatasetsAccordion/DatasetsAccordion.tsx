import { ChangeEvent, useRef, useState } from 'react';
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
interface DatasetsAccordionProps {
  open?: boolean;
  index: number;
  dataset: {
    name: string;
    color: Color;
    borderColor: Color;
  };
}

function DatasetsAccordion({ open = false, index, dataset }: DatasetsAccordionProps) {
  const [isOpen, setOpen] = useState(open);
  const [showModal, setShowModal] = useState(false);

  const [customColor, setCustomColor] = useColor('hex', dataset.color.hex);
  const [value, setValue] = useState(50);

  const [borderColor, setBorderColor] = useColor('hex', dataset.borderColor.hex);
  const [borderValue, setBorderValue] = useState(1);

  const [checked, setChecked] = useState(false);

  const [isVisible, setIsVisible] = useState(true);
  const [edit, setEdit] = useState(false);

  const [datasetName, setDatasetName] = useState(dataset.name);

  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleColorPopup = (event: any) => {
    event.stopPropagation();
    setShowModal(!showModal);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDatasetName(event.target.value);
  };

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
          onToggleVisibility={() => setIsVisible(!isVisible)}
          onEdit={() => {
            setEdit(!edit);
          }}
          onDelete={() => {
            console.log('Delete clicked');
          }}
        />
        <CustomPopup
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
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
                    value={value}
                    onChange={setValue}
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
            value={datasetName}
            onChange={handleNameChange}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                setEdit(false);
              }
            }}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span>{datasetName}</span>
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
              handleToggle={() => setChecked(!checked)}
              colorOne={dataset.color && customColor.hex}
            />
            <DualRangeSlider
              min={0}
              max={100}
              step={25}
              defaultMinValue={25}
              defaultMaxValue={75}
              inactive={checked}
              color={checked ? customColor : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatasetsAccordion;
