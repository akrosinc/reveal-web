import React, { useState } from 'react';
import CustomStepper from '../../../../../../components/CustomStepper/CustomStepper';
import styles from './AddDatasetForm.module.css';
import FileDrop from '../../../../../../components/FileDrop/FileDrop';
import Select from 'react-select';
import RangeInput from '../../../../../../components/RangeInput/RangeInput';
import { ColorPicker, useColor } from 'react-color-palette';

function AddDatasetForm({ onClose }: { onClose: () => void }) {
  const [borderColor, setBorderColor] = useColor('hex', '#000000');
  const [borderValue, setBorderValue] = useState(1);
  return (
    <CustomStepper
      onClose={onClose}
      stepperHeader={'Add Dataset'}
      stepLabels={['Target Area', 'Colors']}
      onFinish={{ label: 'Add Dataset', onClick: () => {} }}
    >
      <section className={styles.step}>
        <p className={styles.stepParagraph}>
          Make sure you upload a JSON file. You can dowload JSON sample link{' '}
          <span className={styles.downloadTemplate}>here</span>
        </p>
        <FileDrop />
        <p className={styles.stepParagraph}>or</p>
        <Select
          components={{
            IndicatorSeparator: () => null
          }}
          placeholder={'Select Dataset'}
          className={styles.select}
          isClearable
          options={[
            { value: '1', label: 'Target Area 1' },
            { value: '2', label: 'Target Area 2' },
            { value: '3', label: 'Target Area 3' }
          ]}
          onChange={() => {
            // handle change
          }}
        />
      </section>
      <section className={styles.step}>
        <div className={styles.previewWrapper}>
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
            width={285.61}
            height={228}
            color={borderColor}
            onChange={setBorderColor}
            hideHEX={true}
            hideHSV={true}
            hideRGB={true}
          />
        </div>
      </section>
    </CustomStepper>
  );
}

export default AddDatasetForm;
